import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { feedPosts, members, currentUser } from '../data/mockData';
import MemberAvatar from '../components/MemberAvatar';

function getMember(id) {
  if (id === 'user-0') return currentUser;
  return members.find((m) => m.id === id) || null;
}

const CATEGORY_COLORS = {
  business: { bg: '#EDF7F0', text: '#1B4332', border: '#B7DFC8' },
  golf: { bg: '#F5EDD0', text: '#A07C2E', border: '#E8C97A' },
  announcement: { bg: '#EEF0F8', text: '#2C3E7A', border: '#BEC5E8' },
};

// Renders post body text with @tagged members highlighted and tappable
function PostBody({ text, tags, onTagPress }) {
  if (!tags || tags.length === 0) {
    return <Text style={styles.postText}>{text}</Text>;
  }

  // Build segments: plain text and tagged member segments
  const segments = [];
  let remaining = text;

  tags.forEach((tag) => {
    const mention = `@${tag.name}`;
    const idx = remaining.indexOf(tag.name);
    if (idx === -1) return;

    // Find the @ before the name
    const atIdx = remaining.lastIndexOf('@', idx);
    if (atIdx !== -1 && atIdx < idx) {
      segments.push({ type: 'text', content: remaining.slice(0, atIdx) });
      segments.push({ type: 'tag', content: mention, tag });
      remaining = remaining.slice(idx + tag.name.length);
    }
  });

  segments.push({ type: 'text', content: remaining });

  return (
    <Text style={styles.postText}>
      {segments.map((seg, i) => {
        if (seg.type === 'tag') {
          return (
            <Text
              key={i}
              style={styles.mentionText}
              onPress={() => onTagPress && onTagPress(seg.tag)}
            >
              {seg.content}
            </Text>
          );
        }
        return <Text key={i}>{seg.content}</Text>;
      })}
    </Text>
  );
}

// Tappable member tag pill below the post
function MemberTagPill({ tag, onPress }) {
  return (
    <TouchableOpacity style={styles.tagPill} onPress={() => onPress(tag)} activeOpacity={0.8}>
      <Text style={styles.tagPillAt}>@</Text>
      <View style={styles.tagPillInfo}>
        <Text style={styles.tagPillName}>{tag.name}</Text>
        <Text style={styles.tagPillCompany}>{tag.company}</Text>
      </View>
    </TouchableOpacity>
  );
}

function CommentRow({ comment }) {
  const author = getMember(comment.authorId);
  if (!author) return null;
  return (
    <View style={styles.commentRow}>
      <MemberAvatar member={author} size={28} />
      <View style={styles.commentBubble}>
        <Text style={styles.commentAuthor}>{author.name}</Text>
        <Text style={styles.commentText}>{comment.text}</Text>
        <Text style={styles.commentTime}>{comment.timestamp}</Text>
      </View>
    </View>
  );
}

function PostCard({ post, onTagPress, onProfilePress, onMessage }) {
  const author = getMember(post.authorId);
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const categoryStyle = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.golf;

  function toggleLike() {
    setLiked((v) => !v);
    setLikeCount((n) => (liked ? n - 1 : n + 1));
  }

  if (!author) return null;

  return (
    <View style={styles.card}>
      {/* Author row */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => onProfilePress(post.authorId)}
          activeOpacity={0.85}
        >
          <MemberAvatar member={author} size={44} />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{author.name}</Text>
            <Text style={styles.authorMeta} numberOfLines={1}>
              {author.title} · {author.company}
            </Text>
            <Text style={styles.postTimestamp}>{post.timestamp}</Text>
          </View>
        </TouchableOpacity>

        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: categoryStyle.bg, borderColor: categoryStyle.border },
          ]}
        >
          <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
            {post.category === 'business'
              ? '💼 Business'
              : post.category === 'announcement'
              ? '📣 News'
              : '⛳ Golf'}
          </Text>
        </View>
      </View>

      {/* Post body */}
      <View style={styles.cardBody}>
        <PostBody text={post.text} tags={post.tags} onTagPress={onTagPress} />
      </View>

      {/* Tagged members */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagPillRow}>
          {post.tags.map((tag) => (
            <MemberTagPill key={tag.memberId} tag={tag} onPress={onTagPress} />
          ))}
        </View>
      )}

      {/* Actions bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={toggleLike} activeOpacity={0.8}>
          <Text style={[styles.actionIcon, liked && styles.actionIconLiked]}>
            {liked ? '♥' : '♡'}
          </Text>
          <Text style={[styles.actionCount, liked && styles.actionCountLiked]}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setCommentsExpanded((v) => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{post.comments.length}</Text>
        </TouchableOpacity>

        {post.authorId !== 'user-0' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onMessage(post.authorId)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>✉️</Text>
            <Text style={styles.actionLabel}>Message</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Comments */}
      {commentsExpanded && post.comments.length > 0 && (
        <View style={styles.commentsSection}>
          <View style={styles.commentsDivider} />
          {post.comments.map((c) => (
            <CommentRow key={c.id} comment={c} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState(feedPosts);

  function handleTagPress(tag) {
    const member = members.find((m) => m.id === tag.memberId);
    if (member) {
      navigation.navigate('Members', {
        screen: 'MemberProfile',
        params: { member },
      });
    }
  }

  function handleProfilePress(authorId) {
    if (authorId === 'user-0') return;
    const member = members.find((m) => m.id === authorId);
    if (member) {
      navigation.navigate('Members', {
        screen: 'MemberProfile',
        params: { member },
      });
    }
  }

  function handleMessage(authorId) {
    navigation.navigate('Messages');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.green.deep} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Club Feed</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreatePost', { onPost: (p) => setPosts((prev) => [p, ...prev]) })}
            activeOpacity={0.85}
          >
            <Text style={styles.createBtnText}>+ Post</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Pebble Ridge Golf Club · Private</Text>
      </View>

      {/* What's on your mind bar */}
      <TouchableOpacity
        style={styles.composerPrompt}
        onPress={() => navigation.navigate('CreatePost', { onPost: (p) => setPosts((prev) => [p, ...prev]) })}
        activeOpacity={0.85}
      >
        <MemberAvatar member={currentUser} size={38} />
        <View style={styles.composerInput}>
          <Text style={styles.composerPlaceholder}>Share something with the club...</Text>
        </View>
        <Text style={styles.composerTagHint}>@ Tag</Text>
      </TouchableOpacity>

      {/* Posts */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onTagPress={handleTagPress}
            onProfilePress={handleProfilePress}
            onMessage={handleMessage}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  headerTitle: { ...Typography.displayMedium, color: Colors.ivory.pure },
  createBtn: {
    backgroundColor: Colors.gold.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createBtnText: { ...Typography.label, color: Colors.charcoal.dark, fontWeight: '700' },
  headerSubtitle: { ...Typography.caption, color: Colors.gold.light, letterSpacing: 0.5 },

  composerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  composerInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  composerPlaceholder: { ...Typography.body, color: Colors.text.muted },
  composerTagHint: {
    ...Typography.label,
    color: Colors.gold.dark,
    fontWeight: '700',
    fontSize: 13,
  },

  listContent: { backgroundColor: Colors.background, paddingBottom: 20 },
  postSeparator: { height: 8, backgroundColor: Colors.background },

  // Post card
  card: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 10,
  },
  authorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  authorInfo: { flex: 1 },
  authorName: { ...Typography.h4, color: Colors.text.primary, marginBottom: 1 },
  authorMeta: { ...Typography.caption, color: Colors.gold.dark, fontWeight: '600', marginBottom: 2 },
  postTimestamp: { ...Typography.caption, color: Colors.text.muted },

  categoryBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  categoryText: { ...Typography.caption, fontWeight: '600', fontSize: 11 },

  cardBody: { paddingHorizontal: 16, paddingBottom: 12 },
  postText: { ...Typography.bodyLarge, color: Colors.text.secondary, lineHeight: 26 },
  mentionText: { color: Colors.green.deep, fontWeight: '700' },

  // Tag pills
  tagPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green.pale,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.green.light,
    gap: 6,
  },
  tagPillAt: {
    ...Typography.h4,
    color: Colors.green.deep,
    fontWeight: '800',
    fontSize: 14,
  },
  tagPillInfo: {},
  tagPillName: { ...Typography.label, color: Colors.green.deep, fontWeight: '700', fontSize: 12 },
  tagPillCompany: { ...Typography.caption, color: Colors.green.mid, fontSize: 10 },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 20,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionIcon: { fontSize: 18, color: Colors.text.muted },
  actionIconLiked: { color: '#C0392B' },
  actionCount: { ...Typography.label, color: Colors.text.muted, fontSize: 13 },
  actionCountLiked: { color: '#C0392B' },
  actionLabel: { ...Typography.label, color: Colors.text.muted, fontSize: 13 },

  // Comments
  commentsSection: { paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  commentsDivider: { height: 1, backgroundColor: Colors.borderLight, marginBottom: 10 },
  commentRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  commentBubble: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentAuthor: { ...Typography.label, color: Colors.green.deep, fontWeight: '700', marginBottom: 3 },
  commentText: { ...Typography.body, color: Colors.text.secondary, lineHeight: 20 },
  commentTime: { ...Typography.caption, color: Colors.text.muted, marginTop: 4 },
});
