import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { members, currentUser } from '../data/mockData';
import MemberAvatar from '../components/MemberAvatar';

const CATEGORIES = [
  { label: '⛳ Golf', value: 'golf' },
  { label: '💼 Business', value: 'business' },
  { label: '📣 News', value: 'announcement' },
];

// Renders the post text with @mentions highlighted inline
function PreviewText({ segments }) {
  return (
    <Text style={styles.previewText}>
      {segments.map((seg, i) =>
        seg.type === 'tag' ? (
          <Text key={i} style={styles.previewMention}>
            @{seg.member.name}
          </Text>
        ) : (
          <Text key={i}>{seg.content}</Text>
        )
      )}
    </Text>
  );
}

export default function CreatePostScreen({ route, navigation }) {
  const { onPost } = route.params || {};

  const [text, setText] = useState('');
  const [category, setCategory] = useState('golf');
  const [taggedMembers, setTaggedMembers] = useState([]);
  const [mentionQuery, setMentionQuery] = useState(null); // null = picker closed
  const inputRef = useRef(null);

  // Parse text into segments for preview
  function buildSegments(raw) {
    const segs = [];
    let remaining = raw;
    taggedMembers.forEach((m) => {
      const token = `@${m.name}`;
      const idx = remaining.indexOf(token);
      if (idx === -1) return;
      segs.push({ type: 'text', content: remaining.slice(0, idx) });
      segs.push({ type: 'tag', member: m });
      remaining = remaining.slice(idx + token.length);
    });
    segs.push({ type: 'text', content: remaining });
    return segs;
  }

  function handleTextChange(val) {
    setText(val);
    // Detect @-trigger: find last @ and extract the query after it
    const atIdx = val.lastIndexOf('@');
    if (atIdx !== -1) {
      const afterAt = val.slice(atIdx + 1);
      // Only show picker if after @ there's no space yet (still typing name)
      if (!afterAt.includes(' ') && afterAt.length <= 30) {
        setMentionQuery(afterAt.toLowerCase());
        return;
      }
    }
    setMentionQuery(null);
  }

  // Filter members for mention picker
  const mentionResults = mentionQuery !== null
    ? members.filter(
        (m) =>
          !taggedMembers.find((t) => t.id === m.id) &&
          (m.name.toLowerCase().includes(mentionQuery) ||
            m.company.toLowerCase().includes(mentionQuery))
      )
    : [];

  function selectMention(member) {
    // Replace the partial @query with the full @Name in the text
    const atIdx = text.lastIndexOf('@');
    const newText = text.slice(0, atIdx) + `@${member.name} `;
    setText(newText);
    setTaggedMembers((prev) => [...prev, member]);
    setMentionQuery(null);
    inputRef.current?.focus();
  }

  function removeTag(memberId) {
    const member = taggedMembers.find((m) => m.id === memberId);
    if (!member) return;
    setTaggedMembers((prev) => prev.filter((m) => m.id !== memberId));
    // Also strip the @Name token from the text
    setText((prev) => prev.replace(`@${member.name}`, '').replace(/\s{2,}/g, ' ').trim());
  }

  function handlePost() {
    if (!text.trim()) return;
    const newPost = {
      id: `post-new-${Date.now()}`,
      authorId: 'user-0',
      timestamp: 'Just now',
      text: text.trim(),
      tags: taggedMembers.map((m) => ({
        memberId: m.id,
        name: m.name,
        company: m.company,
      })),
      likes: 0,
      comments: [],
      liked: false,
      category,
    };
    onPost && onPost(newPost);
    navigation.goBack();
  }

  const canPost = text.trim().length > 0;
  const segments = buildSegments(text);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.green.deep} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Nav */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>New Post</Text>
          <TouchableOpacity
            style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
            onPress={handlePost}
            disabled={!canPost}
            activeOpacity={0.85}
          >
            <Text style={[styles.postBtnText, !canPost && styles.postBtnTextDisabled]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Author identity */}
          <View style={styles.authorRow}>
            <MemberAvatar member={currentUser} size={48} />
            <View>
              <Text style={styles.authorName}>{currentUser.name}</Text>
              <Text style={styles.authorMeta}>
                {currentUser.title} · {currentUser.company}
              </Text>
              <Text style={styles.authorClub}>Pebble Ridge Golf Club · Members Only</Text>
            </View>
          </View>

          {/* Text input */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={"What's on your mind? Type @ to tag a member..."}
            placeholderTextColor={Colors.charcoal.pale}
            value={text}
            onChangeText={handleTextChange}
            multiline
            autoFocus
            maxLength={800}
            textAlignVertical="top"
          />

          {/* Live char count */}
          <Text style={styles.charCount}>{text.length}/800</Text>

          {/* @Mention picker */}
          {mentionQuery !== null && mentionResults.length > 0 && (
            <View style={styles.mentionPicker}>
              <Text style={styles.mentionPickerTitle}>Tag a member</Text>
              {mentionResults.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.mentionRow}
                  onPress={() => selectMention(m)}
                  activeOpacity={0.85}
                >
                  <MemberAvatar member={m} size={36} />
                  <View style={styles.mentionInfo}>
                    <Text style={styles.mentionName}>{m.name}</Text>
                    <Text style={styles.mentionMeta}>
                      {m.title} · {m.company}
                    </Text>
                  </View>
                  <Text style={styles.mentionHcp}>HCP {m.handicap}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tagged member pills */}
          {taggedMembers.length > 0 && (
            <View style={styles.taggedSection}>
              <Text style={styles.taggedSectionLabel}>Tagged Members</Text>
              <View style={styles.taggedList}>
                {taggedMembers.map((m) => (
                  <View key={m.id} style={styles.taggedPill}>
                    <MemberAvatar member={m} size={24} />
                    <View style={styles.taggedPillInfo}>
                      <Text style={styles.taggedPillName}>{m.name}</Text>
                      <Text style={styles.taggedPillCompany}>{m.company}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeTag(m.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.taggedPillRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Category selector */}
          <View style={styles.categorySection}>
            <Text style={styles.categorySectionLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    category === cat.value && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat.value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat.value && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          {text.trim().length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <MemberAvatar member={currentUser} size={36} />
                  <View>
                    <Text style={styles.previewAuthor}>{currentUser.name}</Text>
                    <Text style={styles.previewMeta}>Just now</Text>
                  </View>
                </View>
                <PreviewText segments={segments} />
                {taggedMembers.length > 0 && (
                  <View style={styles.previewTags}>
                    {taggedMembers.map((m) => (
                      <View key={m.id} style={styles.previewTagPill}>
                        <Text style={styles.previewTagAt}>@</Text>
                        <Text style={styles.previewTagName}>{m.name}</Text>
                        <Text style={styles.previewTagCompany}> · {m.company}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
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
    justifyContent: 'space-between',
    backgroundColor: Colors.green.deep,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
    paddingBottom: 12,
  },
  cancelBtn: { padding: 4 },
  cancelText: { ...Typography.label, color: Colors.gold.light, fontWeight: '600' },
  navTitle: { ...Typography.h3, color: Colors.ivory.pure },
  postBtn: {
    backgroundColor: Colors.gold.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnDisabled: { backgroundColor: Colors.charcoal.light },
  postBtnText: { ...Typography.label, color: Colors.charcoal.dark, fontWeight: '700' },
  postBtnTextDisabled: { color: Colors.charcoal.pale },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  authorName: { ...Typography.h4, color: Colors.text.primary },
  authorMeta: { ...Typography.bodySmall, color: Colors.gold.dark, fontWeight: '600', marginTop: 1 },
  authorClub: { ...Typography.caption, color: Colors.text.muted, marginTop: 1 },

  input: {
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    minHeight: 140,
    lineHeight: 26,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.text.muted,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 4,
  },

  // Mention picker
  mentionPicker: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.green.light,
    marginTop: 8,
    overflow: 'hidden',
  },
  mentionPickerTitle: {
    ...Typography.labelSmall,
    color: Colors.text.muted,
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  mentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  mentionInfo: { flex: 1 },
  mentionName: { ...Typography.h4, color: Colors.text.primary },
  mentionMeta: { ...Typography.caption, color: Colors.gold.dark, fontWeight: '500' },
  mentionHcp: {
    ...Typography.labelSmall,
    color: Colors.green.mid,
    fontSize: 10,
    backgroundColor: Colors.green.pale,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.green.light,
  },

  // Tagged pills
  taggedSection: { marginTop: 14 },
  taggedSectionLabel: { ...Typography.labelSmall, color: Colors.text.muted, marginBottom: 8 },
  taggedList: { gap: 8 },
  taggedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green.pale,
    borderRadius: 12,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.green.light,
  },
  taggedPillInfo: { flex: 1 },
  taggedPillName: { ...Typography.label, color: Colors.green.deep, fontWeight: '700' },
  taggedPillCompany: { ...Typography.caption, color: Colors.green.mid },
  taggedPillRemove: {
    fontSize: 14,
    color: Colors.green.mid,
    fontWeight: '700',
    padding: 2,
  },

  // Category
  categorySection: { marginTop: 16 },
  categorySectionLabel: { ...Typography.labelSmall, color: Colors.text.muted, marginBottom: 8 },
  categoryRow: { flexDirection: 'row', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: { backgroundColor: Colors.green.deep, borderColor: Colors.green.deep },
  categoryChipText: { ...Typography.label, color: Colors.text.secondary, fontSize: 13 },
  categoryChipTextActive: { color: Colors.ivory.pure },

  // Preview
  previewSection: { marginTop: 20 },
  previewLabel: { ...Typography.labelSmall, color: Colors.text.muted, marginBottom: 8 },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  previewAuthor: { ...Typography.h4, color: Colors.text.primary },
  previewMeta: { ...Typography.caption, color: Colors.text.muted, marginTop: 1 },
  previewText: { ...Typography.bodyLarge, color: Colors.text.secondary, lineHeight: 26 },
  previewMention: { color: Colors.green.deep, fontWeight: '700' },
  previewTags: { marginTop: 10, gap: 6 },
  previewTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green.pale,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.green.light,
  },
  previewTagAt: { ...Typography.h4, color: Colors.green.deep, fontWeight: '800', fontSize: 13 },
  previewTagName: { ...Typography.label, color: Colors.green.deep, fontWeight: '700', fontSize: 12 },
  previewTagCompany: { ...Typography.caption, color: Colors.green.mid, fontSize: 11 },
});
