import { useEffect } from 'react';
import type { ListRenderItem } from 'react-native';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { rtl } from '@/lib/rtl';

type MovementCategory = {
  id: string;
  title: string;
  count: string;
};

type Routine = {
  id: string;
  title: string;
  category: string;
  duration: string;
  tone: string;
  description: string;
};

const movementCategories: MovementCategory[] = [
  { id: 'breath', title: 'נשימה', count: '3 שגרות' },
  { id: 'mobility', title: 'תנועה עדינה', count: '4 שגרות' },
  { id: 'reset', title: 'איפוס קצר', count: '2 שגרות' },
];

const routines: Routine[] = [
  {
    id: 'box-breathing',
    title: 'נשימת קופסה',
    category: 'נשימה',
    duration: '5 דק׳',
    tone: 'רגוע',
    description: 'ארבע ספירות פנימה, החזקה, החוצה ומנוחה כדי להתחיל מחדש.',
  },
  {
    id: 'shoulder-release',
    title: 'שחרור כתפיים',
    category: 'תנועה עדינה',
    duration: '7 דק׳',
    tone: 'עדין',
    description: 'סיבובים קטנים ומתיחות קצרות כשצריך להוריד עומס מהגוף.',
  },
  {
    id: 'desk-reset',
    title: 'איפוס ליד השולחן',
    category: 'איפוס קצר',
    duration: '3 דק׳',
    tone: 'קליל',
    description: 'כמה תנועות בלי לקום רחוק, רק כדי להחזיר נשימה וקצב.',
  },
];

const rtlRowDirection = Platform.OS === 'web' ? 'row' : rtl.flexDirection;

const renderRoutine: ListRenderItem<Routine> = ({ item }) => (
  <RoutineCard routine={item} />
);

function useWebRtlDocumentDirection() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const html = globalThis.document?.documentElement;
    const body = globalThis.document?.body;
    if (!html || !body) {
      return;
    }

    const previousHtmlDir = html.getAttribute('dir');
    const previousBodyDir = body.getAttribute('dir');

    html.setAttribute('dir', 'rtl');
    body.setAttribute('dir', 'rtl');

    return () => {
      restoreDir(html, previousHtmlDir);
      restoreDir(body, previousBodyDir);
    };
  }, []);
}

function restoreDir(element: HTMLElement, value: string | null) {
  if (value === null) {
    element.removeAttribute('dir');
    return;
  }

  element.setAttribute('dir', value);
}

function RoutineLibraryHeader() {
  return (
    <View style={styles.header}>
      <Text
        className="text-sm text-muted-foreground"
        style={styles.eyebrow}
        testID="movement-library-eyebrow"
      >
        ספריית תנועה
      </Text>
      <Text
        className="text-3xl font-semibold text-foreground"
        style={styles.title}
        testID="movement-library-title"
      >
        בחרי שגרה קטנה לגוף
      </Text>
      <Text
        className="text-base text-muted-foreground"
        style={styles.description}
      >
        הכל כאן קצר, עדין, ולא דורש להיות במצב מושלם. אפשר להתחיל מאיפה שאת.
      </Text>

      <View style={styles.categoryRow} testID="category-list">
        {movementCategories.map((category) => (
          <View
            className="rounded-2xl border border-border bg-card px-4 py-3"
            key={category.id}
            style={styles.categoryChip}
            testID={`category-${category.id}`}
          >
            <Text
              className="text-base font-semibold text-foreground"
              style={styles.categoryTitle}
            >
              {category.title}
            </Text>
            <Text
              className="text-xs text-muted-foreground"
              style={styles.categoryCount}
            >
              {category.count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function RoutineCard({ routine }: { routine: Routine }) {
  return (
    <View
      className="rounded-3xl border border-border bg-card p-4"
      style={styles.card}
      testID={`routine-${routine.id}`}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.routineCopy} testID={`routine-copy-${routine.id}`}>
          <Text
            className="text-xl font-semibold text-foreground"
            style={styles.routineTitle}
          >
            {routine.title}
          </Text>
          <Text
            className="text-sm text-muted-foreground"
            style={styles.routineDescription}
          >
            {routine.description}
          </Text>
        </View>

        <View
          className="rounded-2xl bg-muted px-3 py-2"
          style={styles.routineMeta}
          testID={`routine-meta-${routine.id}`}
        >
          <Text
            className="text-xs font-semibold text-foreground"
            style={styles.metaText}
          >
            {routine.duration}
          </Text>
          <Text
            className="text-xs text-muted-foreground"
            style={styles.metaText}
          >
            {routine.tone}
          </Text>
        </View>
      </View>

      <Text
        className="text-xs font-medium text-muted-foreground"
        style={styles.categoryLabel}
      >
        {routine.category}
      </Text>
    </View>
  );
}

export default function Screen() {
  useWebRtlDocumentDirection();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        ListHeaderComponent={<RoutineLibraryHeader />}
        contentContainerStyle={styles.listContent}
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={renderRoutine}
        testID="movement-library-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 16,
    padding: 24,
  },
  header: {
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 2,
  },
  eyebrow: {
    textAlign: rtl.textAlign,
    writingDirection: 'rtl',
  },
  title: {
    textAlign: rtl.textAlign,
    writingDirection: 'rtl',
  },
  description: {
    maxWidth: 340,
    textAlign: rtl.textAlign,
    writingDirection: 'rtl',
  },
  categoryRow: {
    flexDirection: rtlRowDirection,
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  categoryChip: {
    alignItems: 'flex-end',
    minWidth: 112,
  },
  categoryTitle: {
    textAlign: rtl.textAlign,
    writingDirection: 'rtl',
  },
  categoryCount: {
    textAlign: rtl.textAlign,
    writingDirection: 'rtl',
  },
  card: {
    gap: 12,
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: rtlRowDirection,
    gap: 12,
    justifyContent: 'space-between',
  },
  routineCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: 4,
  },
  routineTitle: {
    textAlign: rtl.textAlign,
    writingDirection: 'rtl',
  },
  routineDescription: {
    textAlign: rtl.textAlign,
    writingDirection: 'rtl',
  },
  routineMeta: {
    alignItems: 'center',
    minWidth: 64,
  },
  metaText: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  categoryLabel: {
    alignSelf: 'flex-end',
    textAlign: rtl.textAlign,
    writingDirection: 'rtl',
  },
});
