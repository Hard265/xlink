import { useState } from 'react';

export function useMessageState() {
  const [hideSubtitle, setHideSubtitle] = useState(true);
  const [selected, setSelected] = useState(false);

  function handleToggleSubtitle() {
    setHideSubtitle(!hideSubtitle);
  }

  function handleLongPress() {
    setSelected(!selected);
  }

  const props = {
    hideSubtitle,
    onPress: handleToggleSubtitle,
    // onLongPress: handleToggleSubtitle,
  };

  return props;
}
