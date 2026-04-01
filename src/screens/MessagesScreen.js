import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { conversations, members, currentUser } from '../data/mockData';
import MemberAvatar from '../components/MemberAvatar';

function getMember(id) {
  if (id === 'user-0') return currentUser;
  return members.find((m) => m.id === id) || null;
}

function ConversationRow({ conv, onPress }) {
  const participant = getMember(conv.participantId);
  if (!participant) return null;

  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(conv)} activeOpacity={0.85}>
      <View style={styles.avatarWrapper}>
        <MemberAvatar member={participant} size={52} />
        {conv.unread > 0 && (
          <View style={styles.unreadDot}>
            <Text style={styles.unreadCount}>{conv.unread}</Text>
          </View>
        )}
      </View>

      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={[styles.participantName, conv.unread > 0 && styles.participantNameBold]}>
            {participant.name}
          </Text>
          <Text style={styles.timeLabel}>{conv.lastMessageTime}</Text>
        </View>

        <Text style={styles.roleLabel} numberOfLines={1}>
          {participant.title} · {participant.company}
        </Text>

        <Text
          style={[styles.lastMessage, conv.unread > 0 && styles.lastMessageBold]}
          numberOfLines={1}
        >
          {conv.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MessagesScreen({ navigation }) {
  const [query, setQuery] = useState('');

  const filtered = conversations.filter((c) => {
    const m = getMember(c.participantId);
    if (!m) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  function openConversation(conv) {
    navigation.navigate('Conversation', { conv });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.green.deep} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Messages</Text>
          {totalUnread > 0 && (
            <View style={styles.totalUnreadBadge}>
              <Text style={styles.totalUnreadText}>{totalUnread} new</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSubtitle}>Private · Members Only</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={Colors.charcoal.pale}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          style={styles.newMsgBtn}
          onPress={() => navigation.navigate('Members')}
          activeOpacity={0.8}
        >
          <Text style={styles.newMsgIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationRow conv={item} onPress={openConversation} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyBody}>
              Connect with a member to start a private conversation.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('Members')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyBtnText}>Browse Members</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.green.deep },

  header: {
    backgroundColor: Colors.green.deep,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  headerTitle: { ...Typography.displayMedium, color: Colors.ivory.pure },
  totalUnreadBadge: {
    backgroundColor: Colors.gold.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  totalUnreadText: { ...Typography.labelSmall, color: Colors.charcoal.dark, fontSize: 10 },
  headerSubtitle: { ...Typography.caption, color: Colors.gold.light, letterSpacing: 0.5 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, ...Typography.body, color: Colors.text.primary, height: 42 },
  newMsgBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.green.deep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newMsgIcon: { fontSize: 18 },

  listContent: { backgroundColor: Colors.background, paddingBottom: 20 },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 82 },

  row: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  avatarWrapper: { position: 'relative' },
  unreadDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.gold.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
    paddingHorizontal: 3,
  },
  unreadCount: { fontSize: 10, fontWeight: '700', color: Colors.charcoal.dark },

  rowContent: { flex: 1, justifyContent: 'center' },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  participantName: { ...Typography.h4, color: Colors.text.primary },
  participantNameBold: { fontWeight: '700', color: Colors.green.deep },
  timeLabel: { ...Typography.caption, color: Colors.text.muted },
  roleLabel: { ...Typography.caption, color: Colors.gold.dark, fontWeight: '500', marginBottom: 3 },
  lastMessage: { ...Typography.body, color: Colors.text.muted },
  lastMessageBold: { color: Colors.text.primary, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 44, marginBottom: 14 },
  emptyTitle: { ...Typography.h2, color: Colors.text.secondary, marginBottom: 8 },
  emptyBody: {
    ...Typography.body,
    color: Colors.text.muted,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: Colors.green.deep,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyBtnText: { ...Typography.label, color: Colors.ivory.pure, fontWeight: '700' },
});
