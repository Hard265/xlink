import React from 'react';
import { Text as TextBase, TextProps } from 'react-native';

import styles from '../misc/styles';

export default function Text({ ...props }: TextProps) {
  return (
    <TextBase {...props} style={[styles.fontFace.InterMedium, props.style]}>
      {props.children}
    </TextBase>
  );
}

export function TextBlack({ ...props }: TextProps) {
  return (
    <TextBase {...props} style={[styles.fontFace.InterBlack, props.style]}>
      {props.children}
    </TextBase>
  );
}
