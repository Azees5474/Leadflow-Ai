import sqlite3
import json
import uuid
from datetime import datetime, timezone

db_path = 'C:/Users/azees/.n8n/database.sqlite'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Get existing workflow
cur.execute('SELECT nodes, connections, versionCounter, settings FROM workflow_entity WHERE id=?', ('AgjNG3F4mE4F9uER',))
row = cur.fetchone()
if not row:
    print("Workflow not found!")
    exit(1)

nodes_raw, conn_raw, version_counter, settings = row
nodes = json.loads(nodes_raw)
connections = json.loads(conn_raw)

# 1. Update 'Send an Email' node
email_node = None
for node in nodes:
    if node['name'] == 'Send an Email':
        email_node = node
        node['parameters']['toEmail'] = '={{ $json.email }}'
        # Ensure stop on error (no continueOnFail)
        node['parameters']['options'] = {}
        if 'continueOnFail' in node:
            del node['continueOnFail']

# 2. Add or update HTTP Request node after Send an Email
existing_callback = next((n for n in nodes if n['name'] == 'HTTP Request 1'), None)
if not existing_callback:
    new_node_id = str(uuid.uuid4())
    new_node = {
        "parameters": {
            "method": "POST",
            "url": "={{ 'http://127.0.0.1:8010/api/leads/' + $('HTTP Request').first().json.id + '/email-sent' }}",
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": "={{ { accepted: $json.accepted ?? [] } }}",
            "options": {}
        },
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [864, -96],
        "id": new_node_id,
        "name": "HTTP Request 1"
    }
    nodes.append(new_node)
else:
    existing_callback["parameters"] = {
        "method": "POST",
        "url": "={{ 'http://127.0.0.1:8010/api/leads/' + $('HTTP Request').first().json.id + '/email-sent' }}",
        "sendBody": True,
        "specifyBody": "json",
        "jsonBody": "={{ { accepted: $json.accepted ?? [] } }}",
        "options": {}
    }

# 3. Connect Send an Email -> HTTP Request 1
connections["Send an Email"] = {
    "main": [
        [
            {
                "node": "HTTP Request 1",
                "type": "main",
                "index": 0
            }
        ]
    ]
}

new_version_id = str(uuid.uuid4())
now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
new_counter = (version_counter or 0) + 1

# Update workflow_entity
cur.execute('''
    UPDATE workflow_entity
    SET nodes=?, connections=?, versionId=?, activeVersionId=?, versionCounter=?, updatedAt=?
    WHERE id=?
''', (
    json.dumps(nodes),
    json.dumps(connections),
    new_version_id,
    new_version_id,
    new_counter,
    now_str,
    'AgjNG3F4mE4F9uER'
))

# Update workflow_published_version
cur.execute('''
    UPDATE workflow_published_version
    SET publishedVersionId=?, updatedAt=?
    WHERE workflowId=?
''', (new_version_id, now_str, 'AgjNG3F4mE4F9uER'))

# Add row to workflow_history
cur.execute('''
    INSERT INTO workflow_history (versionId, workflowId, authors, createdAt, updatedAt, nodes, connections, name, autosaved, description, nodeGroups)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
''', (
    new_version_id,
    'AgjNG3F4mE4F9uER',
    'ajies s',
    now_str,
    now_str,
    json.dumps(nodes),
    json.dumps(connections),
    f"Version {new_version_id[:8]}",
    0,
    None,
    '[]'
))

conn.commit()
conn.close()
print(f"Successfully updated workflow AgjNG3F4mE4F9uER with version {new_version_id}!")
