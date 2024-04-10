import { Feather } from '@expo/vector-icons';

import { useSession } from '../providers/SessionProvider';
import { Message } from '../store/store';

interface StateProps {
  message: Message;
}

export default function State({ message }: StateProps) {
  const { session } = useSession();

  return (
    session?.address === message.sender &&
    (message.state === 'PENDING' ? (
      <Feather name="clock" size={14} />
    ) : message.state === 'SENT' ? (
      <Feather name="check-circle" size={14} />
    ) : (
      <Feather name="x-circle" color="#DC2626" size={14} />
    ))
  );
}
