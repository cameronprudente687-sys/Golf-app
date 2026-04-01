import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { members } from '../data/mockData';
import MemberAvatar from '../components/MemberAvatar';

// ─── Filter definitions ────────────────────────────────────────────────────────

const HANDICAP_FILTERS = [
  { label: 'All', value: null },
  { label: '0–5', value: [0, 5] },
  { label: '6–12', value: [6, 12] },
  { label: '13–20', value: [13, 20] },
  { label: '21+', value: [21, 54] },
];

const PROFESSION_FILTERS = [
  { label: 'All', value: null },
  { label: 'Finance', value: 'finance' },
  { label: 'Legal', value: 'legal' },
  { label: 'Medical', value: 'medical' },
  { label: 'Tech', value: 'tech' },
  { label: 'Real Estate', value: 'realestate' },
];

const INTEREST_FILTERS = [
  { label: 'All', value: null },
  { label: 'Stroke Play', value: 'Stroke Play' },
  { label: 'Match Play', value: 'Match Play' },
  { label: 'Foursomes', value: 'Foursomes' },
  { label: 'Scramble', value: 'Scramble' },
];

const PROFESSION_KEYWORDS = {
  finance: ['capital', 'banking', 'portfolio', 'ventures', 'financial', 'investment'],
  legal: ['law', 'attorney', 'legal', 'counsel'],
  medical: ['surgeon', 'doctor', 'medical', 'physician', 'md'],
  tech: ['tech', 'software', 'digital', 'technology'],
  realestate: ['real estate', 'property', 'development', 'developer'],
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function FilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function FilterRow({ label, filters, activeValue, onSelect }) {
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {filters.map((f) => (
          <FilterChip
            key={String(f.value)}
            label={f.label}
            active={activeValue === f.value || (activeValue && JSON.stringify(activeValue) === JSON.stringify(f.value))}
            onPress={() => onSelect(f.value)}
          />
        ))}
      </View>
    </View>
  );
}

function MemberCard({ member, onPress, onConnect }) {
  const [connected, setConnected] = useState(member.connected);

  function handleConnect(e) {
    e.stopPropagation();
    setConnected(true);
    onConnect && onConnect(member);
  }

  return (
    <TouchableOpacity style={styles.memberCard} onPress={() => onPress(member)} activeOpacity={0.87}>
      <MemberAvatar member={member} size={60} />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{member.name}</Text>
          <View style={styles.handicapBadge}>
            <Text style={styles.handicapLabel}>HCP</Text>
            <Text style={styles.handicapValue}>{member.handicap}</Text>
          </View>
        </View>
        <Text style={styles.memberTitle} numberOfLines={1}>
          {member.title}
        </Text>
        <Text style={styles.memberCompany} numberOfLines={1}>
          {member.company}
        </Text>
        <Text style={styles.memberBio} numberOfLines={2}>
          {member.bio}
        </Text>

        <View style={styles.memberFooter}>
          <View style={styles.interestsList}>
            {member.interests.slice(0, 2).map((interest) => (
              <View key={interest} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.cardConnectBtn, connected && styles.cardConnectBtnActive]}
            onPress={handleConnect}
            activeOpacity={0.8}
          >
            <Text style={[styles.cardConnectText, connected && styles.cardConnectTextActive]}>
              {connected ? '✓ Connected' : '+ Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function MemberDirectoryScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [handicapFilter, setHandicapFilter] = useState(null);
  const [professionFilter, setProfessionFilter] = useState(null);
  const [interestFilter, setInterestFilter] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      // Search query
      if (query.trim()) {
        const q = query.toLowerCase();
        const haystack = [m.name, m.title, m.company, m.bio, ...m.interests]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // Handicap filter
      if (handicapFilter) {
        const [min, max] = handicapFilter;
        if (m.handicap < min || m.handicap > max) return false;
      }

      // Profession filter
      if (professionFilter) {
        const keywords = PROFESSION_KEYWORDS[professionFilter] || [];
        const hay = [m.title, m.company].join(' ').toLowerCase();
        if (!keywords.some((kw) => hay.includes(kw))) return false;
      }

      // Interest / format filter
      if (interestFilter) {
        if (!m.interests.includes(interestFilter)) return false;
      }

      return true;
    });
  }, [query, handicapFilter, professionFilter, interestFilter]);

  const activeFilterCount = [handicapFilter, professionFilter, interestFilter].filter(Boolean).length;

  function navigateToProfile(member) {
    navigation.navigate('MemberProfile', { member });
  }

  function clearFilters() {
    setHandicapFilter(null);
    setProfessionFilter(null);
    setInterestFilter(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.green.deep} />

      {/* ── Screen Header ── */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Member Directory</Text>
        <Text style={styles.screenSubtitle}>Pebble Ridge Golf Club</Text>
      </View>

      {/* ── Search + Filter bar ── */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search members, roles, interests..."
            placeholderTextColor={Colors.charcoal.pale}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          style={[styles.filterToggle, activeFilterCount > 0 && styles.filterToggleActive]}
          onPress={() => setFiltersVisible((v) => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.filterToggleText}>
            {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filter'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Filter Panel ── */}
      {filtersVisible && (
        <View style={styles.filterPanel}>
          <FilterRow
            label="Handicap"
            filters={HANDICAP_FILTERS}
            activeValue={handicapFilter}
            onSelect={setHandicapFilter}
          />
          <FilterRow
            label="Profession"
            filters={PROFESSION_FILTERS}
            activeValue={professionFilter}
            onSelect={setProfessionFilter}
          />
          <FilterRow
            label="Format"
            filters={INTEREST_FILTERS}
            activeValue={interestFilter}
            onSelect={setInterestFilter}
          />
          {activeFilterCount > 0 && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearFilters}>
              <Text style={styles.clearFiltersText}>Clear all filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Results count ── */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filtered.length} {filtered.length === 1 ? 'member' : 'members'}
        </Text>
      </View>

      {/* ── Member List ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemberCard member={item} onPress={navigateToProfile} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No members found</Text>
            <Text style={styles.emptyBody}>Try adjusting your search or filters.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.green.deep,
  },

  // Header
  screenHeader: {
    backgroundColor: Colors.green.deep,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 16,
  },
  screenTitle: {
    ...Typography.displayMedium,
    color: Colors.ivory.pure,
    marginBottom: 2,
  },
  screenSubtitle: {
    ...Typography.caption,
    color: Colors.gold.light,
    letterSpacing: 0.5,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputWrapper: {
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
  searchIcon: {
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    height: 42,
  },
  filterToggle: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterToggleActive: {
    backgroundColor: Colors.green.deep,
    borderColor: Colors.green.deep,
  },
  filterToggleText: {
    ...Typography.label,
    color: Colors.text.secondary,
    fontSize: 13,
  },

  // Filter Panel
  filterPanel: {
    backgroundColor: Colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  filterLabel: {
    ...Typography.labelSmall,
    color: Colors.text.muted,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.green.deep,
    borderColor: Colors.green.deep,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.ivory.pure,
  },
  clearFilters: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  clearFiltersText: {
    ...Typography.label,
    color: Colors.gold.dark,
  },

  // Results
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultsCount: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
    fontWeight: '500',
  },

  // List
  listContent: {
    backgroundColor: Colors.background,
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 92,
  },

  // Member Cards
  memberCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  memberName: {
    ...Typography.h3,
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  handicapBadge: {
    backgroundColor: Colors.green.pale,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.green.light,
  },
  handicapLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.green.deep,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  handicapValue: {
    ...Typography.h4,
    color: Colors.green.deep,
    lineHeight: 18,
  },
  memberTitle: {
    ...Typography.bodySmall,
    color: Colors.gold.dark,
    fontWeight: '600',
    marginBottom: 1,
  },
  memberCompany: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
    marginBottom: 6,
  },
  memberBio: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  memberFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  interestsList: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  interestTag: {
    backgroundColor: Colors.ivory.warm,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  interestText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  cardConnectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.green.deep,
  },
  cardConnectBtnActive: {
    backgroundColor: Colors.green.deep,
  },
  cardConnectText: {
    ...Typography.label,
    color: Colors.green.deep,
    fontSize: 12,
  },
  cardConnectTextActive: {
    color: Colors.ivory.pure,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  emptyBody: {
    ...Typography.body,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});
