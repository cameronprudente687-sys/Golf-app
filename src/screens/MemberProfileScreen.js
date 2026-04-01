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
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import MemberAvatar from '../components/MemberAvatar';

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatBadge({ label, value, large }) {
  return (
    <View style={[styles.statBadge, large && styles.statBadgeLarge]}>
      <Text style={[styles.statValue, large && styles.statValueLarge]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionCard({ title, children }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <View style={styles.infoRow}>
      {icon && <Text style={styles.infoIcon}>{icon}</Text>}
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActionButton({ label, icon, onPress, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGold = variant === 'gold';

  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        isPrimary && styles.actionBtnPrimary,
        isOutline && styles.actionBtnOutline,
        isGold && styles.actionBtnGold,
      ]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <Text style={styles.actionBtnIcon}>{icon}</Text>
      <Text
        style={[
          styles.actionBtnText,
          isPrimary && styles.actionBtnTextPrimary,
          isOutline && styles.actionBtnTextOutline,
          isGold && styles.actionBtnTextGold,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function MemberProfileScreen({ route, navigation }) {
  const { member } = route.params;
  const [connected, setConnected] = useState(member.connected);

  function handleConnect() {
    setConnected(true);
    Alert.alert(
      'Connection Requested',
      `Your connection request has been sent to ${member.name}.`,
      [{ text: 'OK' }]
    );
  }

  function handleRequestIntro() {
    Alert.alert(
      'Request an Introduction',
      `A mutual connection will introduce you to ${member.name}. This feature is coming soon.`,
      [{ text: 'OK' }]
    );
  }

  function handleInviteToPlay() {
    Alert.alert(
      'Invite to Play',
      `An invitation to join a round has been sent to ${member.name}.`,
      [{ text: 'Send Invite' }, { text: 'Cancel', style: 'cancel' }]
    );
  }

  const prefs = member.golfPreferences;
  const yearsAsMember = 2026 - member.memberSince;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.green.deep} />

      {/* ── Nav Back ── */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backLabel}>Members</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
          <Text style={styles.menuIcon}>···</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Banner ── */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBg} />
          <View style={styles.heroContent}>
            <MemberAvatar member={member} size={96} />
            <View style={styles.heroText}>
              <Text style={styles.heroName}>{member.name}</Text>
              <Text style={styles.heroTitle}>{member.title}</Text>
              <Text style={styles.heroCompany}>{member.company}</Text>
            </View>
          </View>
        </View>

        {/* ── Quick Stats ── */}
        <View style={styles.statsRow}>
          <StatBadge label="Handicap" value={member.handicap} large />
          <View style={styles.statDivider} />
          <StatBadge label="Member Since" value={member.memberSince} />
          <View style={styles.statDivider} />
          <StatBadge label="Years as Member" value={yearsAsMember} />
          <View style={styles.statDivider} />
          <StatBadge label="Rounds / Mo" value={prefs.roundsPerMonth} />
        </View>

        {/* ── Primary Actions ── */}
        <View style={styles.actionRow}>
          <ActionButton
            label="Invite to Play"
            icon="⛳"
            variant="primary"
            onPress={handleInviteToPlay}
          />
          <ActionButton
            label="Request Intro"
            icon="🤝"
            variant="gold"
            onPress={handleRequestIntro}
          />
          {!connected && (
            <ActionButton
              label="Connect"
              icon="+"
              variant="outline"
              onPress={handleConnect}
            />
          )}
          {connected && (
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedIcon}>✓</Text>
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* ── About ── */}
          <SectionCard title="About">
            <Text style={styles.bioText}>{member.bio}</Text>
          </SectionCard>

          {/* ── Golf Preferences ── */}
          <SectionCard title="Golf Preferences">
            <InfoRow icon="🕐" label="Preferred Tee Time" value={prefs.preferredTeeTime} />
            <InfoRow icon="🏌️" label="Favorite Format" value={prefs.favoriteFormat} />
            <InfoRow icon="📍" label="Home Course" value={prefs.homeCourse} />
            <InfoRow icon="📅" label="Rounds per Month" value={`${prefs.roundsPerMonth} rounds`} />
          </SectionCard>

          {/* ── Interests ── */}
          <SectionCard title="Interests">
            <View style={styles.tagCloud}>
              {member.interests.map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </SectionCard>

          {/* ── Membership ── */}
          <SectionCard title="Membership">
            <InfoRow icon="🏛️" label="Club" value="Pebble Ridge Golf Club" />
            <InfoRow icon="📋" label="Member Since" value={String(member.memberSince)} />
            <InfoRow
              icon="🔒"
              label="Profile Visibility"
              value="Members Only"
            />
          </SectionCard>
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
    paddingBottom: 40,
  },

  // Nav
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.green.deep,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
    paddingBottom: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  backIcon: {
    fontSize: 26,
    color: Colors.gold.primary,
    fontWeight: '300',
    lineHeight: 26,
  },
  backLabel: {
    ...Typography.label,
    color: Colors.gold.primary,
    fontWeight: '600',
  },
  menuBtn: {
    padding: 8,
  },
  menuIcon: {
    color: Colors.ivory.warm,
    fontSize: 20,
    letterSpacing: 2,
  },

  // Hero
  heroBanner: {
    backgroundColor: Colors.green.deep,
    paddingBottom: 28,
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.green.deep,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  heroText: {
    flex: 1,
    paddingBottom: 4,
  },
  heroName: {
    ...Typography.displayMedium,
    color: Colors.ivory.pure,
    marginBottom: 4,
  },
  heroTitle: {
    ...Typography.label,
    color: Colors.gold.light,
    fontWeight: '600',
    marginBottom: 2,
  },
  heroCompany: {
    ...Typography.bodySmall,
    color: Colors.green.pale,
    opacity: 0.85,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statBadge: {
    alignItems: 'center',
    flex: 1,
  },
  statBadgeLarge: {
    flex: 1.2,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.green.deep,
    marginBottom: 2,
  },
  statValueLarge: {
    ...Typography.displayMedium,
    color: Colors.green.deep,
  },
  statLabel: {
    ...Typography.labelSmall,
    color: Colors.text.muted,
    textAlign: 'center',
    fontSize: 9,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.green.deep,
  },
  actionBtnGold: {
    backgroundColor: Colors.gold.primary,
  },
  actionBtnOutline: {
    borderWidth: 1.5,
    borderColor: Colors.green.deep,
    backgroundColor: 'transparent',
  },
  actionBtnIcon: {
    fontSize: 14,
  },
  actionBtnText: {
    ...Typography.label,
    fontSize: 12,
  },
  actionBtnTextPrimary: {
    color: Colors.ivory.pure,
    fontWeight: '700',
  },
  actionBtnTextGold: {
    color: Colors.charcoal.dark,
    fontWeight: '700',
  },
  actionBtnTextOutline: {
    color: Colors.green.deep,
    fontWeight: '700',
  },
  connectedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: Colors.green.pale,
    borderWidth: 1,
    borderColor: Colors.green.light,
  },
  connectedIcon: {
    fontSize: 14,
    color: Colors.green.deep,
  },
  connectedText: {
    ...Typography.label,
    color: Colors.green.deep,
    fontWeight: '700',
    fontSize: 12,
  },

  // Body sections
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionCardTitle: {
    ...Typography.labelSmall,
    color: Colors.text.muted,
    marginBottom: 12,
    letterSpacing: 0.8,
  },

  // Bio
  bioText: {
    ...Typography.bodyLarge,
    color: Colors.text.secondary,
    lineHeight: 26,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  infoIcon: {
    fontSize: 18,
    width: 26,
    textAlign: 'center',
  },
  infoContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.text.muted,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },

  // Tags
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.ivory.warm,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    ...Typography.label,
    color: Colors.text.secondary,
    fontSize: 13,
  },
});
