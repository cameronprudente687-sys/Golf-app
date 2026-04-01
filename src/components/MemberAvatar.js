import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

/**
 * Renders a circular avatar with initials and a member's accent color.
 * Replace with <Image> when real photo URLs are available.
 */
export default function MemberAvatar({ member, size = 48 }) {
  const fontSize = Math.round(size * 0.36);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: member.avatarColor || Colors.green.mid,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{member.initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold.primary,
  },
  initials: {
    ...Typography.h3,
    color: Colors.ivory.pure,
    fontWeight: '700',
  },
});
