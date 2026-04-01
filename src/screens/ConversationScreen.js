import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { members, currentUser } from '../data/mockData';
import MemberAvatar from '../components/MemberAvatar';

function getMember(id) {
  if (id === 'user-0') return currentUser;
  return members.find((m) => m.id === id) || null;
}

function Bubble({ message, isOwn, showAvatar, member }) {
  return (
    <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
      {!isOwn && (
        <View style={styles.bubbleAvatar}>
          {showAvatar ? (
            <MemberAvatar member={member} size={32} />
          ) : (
            <View style={styles.bubbleAvatarSpacer} />
          )}
        </View>
      )}

      <View style={styles.bubbleContent}>
        {!isOwn && showAvatar && (
          <Text style={styles.bubbleSenderName}>{member?.name}</Text>
        )}
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>
            {message.text}
          </Text>
        </View>
        <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>
          {message.time}
        </Text>
      </View>
    </View>
  );
}

function DateDivider({ label }) {
  return (
    <View style={styles.dateDivider}>
      <View style={styles.dateLine} />
      <Text style={styles.dateLabel}>{label}</Text>
      <View style={styles.dateLine} />
    </View>
  );
}

export default function ConversationScreen({ route, navigation }) {
  const { conv } = route.params;
  const participant = getMember(conv.participantId);
  const flatRef = useRef(null);

  const [messages, setMessages] = useState(conv.messages);
  const [draft, setDraft] = useState('');

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const newMsg = {
      id: `msg-new-${Date.now()}`,
      senderId: 'user-0',
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      date: 'Today',
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraft('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }

  // Group messages by date
  const grouped = [];
  let lastDate = null;
  messages.forEach((msg) => {
    if (msg.date !== lastDate) {
      grouped.push({ type: 'date', id: `date-${msg.date}`, label: msg.date });
      lastDate = msg.date;
    }
    grouped.push({ type: 'message', ...msg });
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.green.deep} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Nav */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backLabel}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerCenter}
            onPress={() =>
              navigation.navigate('Members', {
                screen: 'MemberProfile',
                params: { member: participant },
              })
            }
            activeOpacity={0.8}
          >
            <MemberAvatar member={participant} size={36} />
            <View>
              <Text style={styles.headerName}>{participant?.name}</Text>
              <Text style={styles.headerRole} numberOfLines={1}>
                {participant?.title} · {participant?.company}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBtn}>
            <Text style={styles.menuDots}>···</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatRef}
          data={grouped}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item, index }) => {
            if (item.type === 'date') {
              return <DateDivider key={item.id} label={item.label} />;
            }
            const isOwn = item.senderId === 'user-0';
            const sender = getMember(item.senderId);
            // Show avatar only on first message or after a date divider
            const prevItem = grouped[index - 1];
            const showAvatar =
              !isOwn &&
              (prevItem?.type === 'date' || prevItem?.senderId !== item.senderId);

            return (
              <Bubble
                key={item.id}
                message={item}
                isOwn={isOwn}
                showAvatar={showAvatar}
                member={sender}
              />
            );
          }}
        />

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={Colors.charcoal.pale}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!draft.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.green.deep },
  flex: { flex: 1, backgroundColor: Colors.background },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green.deep,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
    paddingBottom: 10,
    gap: 8,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backIcon: { fontSize: 26, color: Colors.gold.primary, fontWeight: '300', lineHeight: 26 },
  backLabel: { ...Typography.label, color: Colors.gold.primary, fontWeight: '600' },

  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 8,
  },
  headerName: { ...Typography.h4, color: Colors.ivory.pure, textAlign: 'center' },
  headerRole: { ...Typography.caption, color: Colors.gold.light, textAlign: 'center', maxWidth: 160 },

  menuBtn: { padding: 8 },
  menuDots: { color: Colors.ivory.warm, fontSize: 18, letterSpacing: 2 },

  messageList: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 8 },

  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dateLabel: { ...Typography.caption, color: Colors.text.muted, fontWeight: '500' },

  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
    gap: 8,
  },
  bubbleRowOwn: { justifyContent: 'flex-end' },
  bubbleAvatar: { width: 32 },
  bubbleAvatarSpacer: { width: 32 },
  bubbleContent: { maxWidth: '75%' },
  bubbleSenderName: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginBottom: 3,
    marginLeft: 12,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOwn: {
    backgroundColor: Colors.green.deep,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleText: { ...Typography.body, color: Colors.text.primary, lineHeight: 20 },
  bubbleTextOwn: { color: Colors.ivory.pure },
  bubbleTime: {
    ...Typography.caption,
    color: Colors.text.light,
    marginTop: 3,
    marginLeft: 4,
  },
  bubbleTimeOwn: { textAlign: 'right', marginRight: 4, marginLeft: 0 },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 10,
    gap: 10,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    minHeight: 42,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green.deep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.charcoal.pale },
  sendIcon: {
    fontSize: 18,
    color: Colors.ivory.pure,
    fontWeight: '700',
    marginTop: -1,
  },
});
