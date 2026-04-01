import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import {
  currentUser,
  clubUpdates,
  upcomingRounds,
  suggestedConnections,
} from '../data/mockData';
import MemberAvatar from '../components/MemberAvatar';

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function UpdateCard({ update }) {
  return (
    <View style={styles.updateCard}>
      <Text style={styles.updateIcon}>{update.icon}</Text>
      <View style={styles.updateContent}>
        <Text style={styles.updateTitle}>{update.title}</Text>
        <Text style={styles.updateBody} numberOfLines={2}>
          {update.body}
        </Text>
        <Text style={styles.updateDate}>
          {new Date(update.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
    </View>
  );
}

function SuggestedMemberCard({ member, onConnect, onView }) {
  const [connected, setConnected] = useState(member.connected);

  function handleConnect() {
    setConnected(true);
    onConnect && onConnect(member);
  }

  return (
    <TouchableOpacity style={styles.suggestedCard} onPress={() => onView(member)} activeOpacity={0.85}>
      <MemberAvatar member={member} size={52} />
      <View style={styles.suggestedInfo}>
        <Text style={styles.suggestedName}>{member.name}</Text>
        <Text style={styles.suggestedRole} numberOfLines={1}>
          {member.title} · {member.company}
        </Text>
        <Text style={styles.suggestedHandicap}>HCP {member.handicap}</Text>
      </View>
      <TouchableOpacity
        style={[styles.connectBtn, connected && styles.connectBtnActive]}
        onPress={handleConnect}
        activeOpacity={0.8}
      >
        <Text style={[styles.connectBtnText, connected && styles.connectBtnTextActive]}>
          {connected ? 'Connected' : 'Connect'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function RoundCard({ round }) {
  return (
    <View style={styles.roundCard}>
      <View style={styles.roundDateBadge}>
        <Text style={styles.roundDateDay}>
          {round.date.split(',')[0].trim()}
        </Text>
        <Text style={styles.roundDateNum}>
          {round.date.split(' ').pop()}
        </Text>
      </View>
      <View style={styles.roundInfo}>
        <Text style={styles.roundCourse}>{round.course}</Text>
        <Text style={styles.roundMeta}>
          {round.time} · {round.format} · {round.holes} holes
        </Text>
        <Text style={styles.roundPlayers} numberOfLines={1}>
          With {round.players.join(', ')}
        </Text>
      </View>
      <View style={styles.roundArrow}>
        <Text style={styles.roundArrowText}>›</Text>
      </View>
    </View>
  );
}

function QuickAction({ icon, label, onPress, accent }) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, accent && styles.quickActionAccent]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={[styles.quickActionLabel, accent && styles.quickActionLabelAccent]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  function navigateToMember(member) {
    navigation.navigate('Members', {
      screen: 'MemberProfile',
      params: { member },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.green.deep} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.headerName}>{currentUser.name.split(' ')[0]}</Text>
            </View>
            <MemberAvatar member={currentUser} size={44} />
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.clubBadge}>
            <Text style={styles.clubBadgeIcon}>⛳</Text>
            <Text style={styles.clubBadgeName}>{currentUser.club}</Text>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.quickActions}>
          <QuickAction icon="📅" label="Book a Round" accent />
          <QuickAction icon="🤝" label="Find Members" />
          <QuickAction icon="📊" label="My Stats" />
          <QuickAction icon="📣" label="Events" />
        </View>

        {/* ── Club Updates ── */}
        <View style={styles.section}>
          <SectionHeader title="Club Updates" actionLabel="See all" />
          {clubUpdates.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))}
        </View>

        {/* ── Suggested Connections ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Members You May Know"
            actionLabel="Browse all"
            onAction={() => navigation.navigate('Members')}
          />
          {suggestedConnections.map((member) => (
            <SuggestedMemberCard
              key={member.id}
              member={member}
              onView={navigateToMember}
            />
          ))}
        </View>

        {/* ── Upcoming Rounds ── */}
        <View style={[styles.section, styles.sectionLast]}>
          <SectionHeader title="Upcoming Rounds" actionLabel="Schedule" />
          {upcomingRounds.map((round) => (
            <RoundCard key={round.id} round={round} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.green.deep,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Header
  header: {
    backgroundColor: Colors.green.deep,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    ...Typography.bodySmall,
    color: Colors.green.pale,
    opacity: 0.8,
    marginBottom: 2,
  },
  headerName: {
    ...Typography.displayMedium,
    color: Colors.ivory.pure,
  },
  headerDivider: {
    height: 1,
    backgroundColor: Colors.gold.primary,
    opacity: 0.3,
    marginVertical: 14,
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubBadgeIcon: {
    fontSize: 14,
  },
  clubBadgeName: {
    ...Typography.caption,
    color: Colors.gold.light,
    letterSpacing: 0.5,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    backgroundColor: Colors.background,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionAccent: {
    backgroundColor: Colors.green.deep,
    borderColor: Colors.green.deep,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionLabel: {
    ...Typography.labelSmall,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontSize: 10,
  },
  quickActionLabelAccent: {
    color: Colors.ivory.pure,
  },

  // Sections
  section: {
    marginTop: 4,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    paddingBottom: 4,
  },
  sectionLast: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  sectionAction: {
    ...Typography.label,
    color: Colors.gold.dark,
    fontWeight: '600',
  },

  // Update Cards
  updateCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 14,
  },
  updateIcon: {
    fontSize: 22,
    marginTop: 1,
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 3,
  },
  updateBody: {
    ...Typography.body,
    color: Colors.text.muted,
    lineHeight: 19,
    marginBottom: 5,
  },
  updateDate: {
    ...Typography.caption,
    color: Colors.gold.dark,
    fontWeight: '500',
  },

  // Suggested Member Cards
  suggestedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedName: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  suggestedRole: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
    marginBottom: 3,
  },
  suggestedHandicap: {
    ...Typography.labelSmall,
    color: Colors.green.mid,
    fontSize: 10,
  },
  connectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.green.deep,
  },
  connectBtnActive: {
    backgroundColor: Colors.green.deep,
  },
  connectBtnText: {
    ...Typography.label,
    color: Colors.green.deep,
    fontSize: 12,
  },
  connectBtnTextActive: {
    color: Colors.ivory.pure,
  },

  // Round Cards
  roundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 14,
  },
  roundDateBadge: {
    width: 48,
    height: 52,
    backgroundColor: Colors.green.pale,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.green.light,
  },
  roundDateDay: {
    ...Typography.labelSmall,
    color: Colors.green.deep,
    fontSize: 9,
    marginBottom: 1,
  },
  roundDateNum: {
    ...Typography.h2,
    color: Colors.green.deep,
    lineHeight: 22,
  },
  roundInfo: {
    flex: 1,
  },
  roundCourse: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 3,
  },
  roundMeta: {
    ...Typography.bodySmall,
    color: Colors.gold.dark,
    marginBottom: 2,
    fontWeight: '500',
  },
  roundPlayers: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
  },
  roundArrow: {
    width: 24,
    alignItems: 'center',
  },
  roundArrowText: {
    fontSize: 22,
    color: Colors.charcoal.pale,
    fontWeight: '300',
  },
});
