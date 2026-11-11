import Badge from './Badge';

export default function EmailStatus({ sentAt }) {
  return (
    <Badge variant={sentAt ? 'connected' : 'pending'}>
      {sentAt ? 'Sent' : 'Unconfirmed'}
    </Badge>
  );
}
