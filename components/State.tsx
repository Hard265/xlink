import { Feather } from '@expo/vector-icons';

import { useSession } from '../providers/SessionProvider';
import { MESSAGE_STATE, Message } from '../store/store';

interface StateProps {
  message: Message;
}

export default function State({ message }: StateProps) {
  const { session } = useSession();

  if (session?.address !== message.sender) return;
  else {
    if (message.state === MESSAGE_STATE.PENDING) return <Feather name="circle" size={14} />;
    if (message.state === MESSAGE_STATE.SENT) return <Feather name="check" size={14} />;
    if (message.state === MESSAGE_STATE.DELIVERED) return <Feather name="check" color="#16A34A" size={14} />;
    else if (message.state === MESSAGE_STATE.FAILED) return <Feather name="alert-circle" color="#DC2626" size={14} />;
  }

  return (
    session?.address === message.sender &&
    (message.state === MESSAGE_STATE.PENDING ? (
      <Feather name="circle" size={14} />
    ) : message.state === MESSAGE_STATE.SENT ? (
      <Feather name="check-circle" size={14} />
    ) : (
      <Feather name="x-circle" color="#DC2626" size={14} />
    ))
  );
}
