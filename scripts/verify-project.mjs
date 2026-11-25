import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let passed = 0;
let failed = 0;

function check(label, condition, hint = '') {
  if (condition) {
    console.log(`✅ PASS | ${label}`);
    passed++;
  } else {
    console.log(`❌ FAIL | ${label}${hint ? ` -> Gợi ý: ${hint}` : ''}`);
    failed++;
  }
}

const exists = (relPath) => fs.existsSync(path.join(root, relPath));
const readText = (relPath) =>
  exists(relPath) ? fs.readFileSync(path.join(root, relPath), 'utf8') : '';
const readJson = (relPath) => {
  try {
    return JSON.parse(readText(relPath));
  } catch {
    return null;
  }
};

console.log('\n=== 1. GỐC MONOREPO & TOOLING ===');
const rootPkg = readJson('package.json');
check(
  'File .gitignore tồn tại & chặn node_modules',
  readText('.gitignore').includes('node_modules'),
);
check(
  'File .npmrc có node-linker=hoisted',
  readText('.npmrc').includes('node-linker=hoisted'),
);
check('File pnpm-workspace.yaml tồn tại', exists('pnpm-workspace.yaml'));
check(
  'Có .prettierrc & .prettierignore',
  exists('.prettierrc') && exists('.prettierignore'),
);
check('Có eslint.config.js', exists('eslint.config.js'));
check(
  'Root package.json có scripts lint & format',
  Boolean(rootPkg?.scripts?.lint && rootPkg?.scripts?.format),
);

console.log('\n=== 2. LIB/SHARED (@caro/shared) ===');
const sharedPkg = readJson('lib/shared/package.json');
const sharedRules = readText('lib/shared/src/game-rules.ts');
check('Tên package là @caro/shared', sharedPkg?.name === '@caro/shared');
check(
  'Có đủ constants, types, game-rules, index',
  exists('lib/shared/src/constants.ts') &&
    exists('lib/shared/src/types.ts') &&
    exists('lib/shared/src/game-rules.ts') &&
    exists('lib/shared/src/index.ts'),
);
check(
  'lib/shared không import ngược từ apps/',
  !sharedRules.includes('apps/mobile'),
);

console.log('\n=== 3. MỤC 3.3 — EXPO ROUTER, DEPENDENCIES & FORM ===');
const mobilePkg = readJson('src/apps/mobile/package.json');
const mobileAppJson = readJson('src/apps/mobile/app.json');
const deps = mobilePkg?.dependencies ?? {};
const layoutSrc = readText('src/apps/mobile/src/app/_layout.tsx');
const loginSrc = readText('src/apps/mobile/src/screens/LoginScreen.tsx');

check(
  'mobile/package.json trỏ "main": "expo-router/entry"',
  mobilePkg?.main === 'expo-router/entry',
);
check(
  'mobile/app.json đã khai báo "scheme"',
  Boolean(mobileAppJson?.expo?.scheme),
);
check(
  'Đã dọn dẹp App.tsx & navigation/RootNavigator.tsx cũ',
  !exists('src/apps/mobile/App.tsx') &&
    !exists('src/apps/mobile/src/navigation/RootNavigator.tsx'),
);
check(
  'Đã cài expo-router, zustand, @tanstack/react-query',
  Boolean(
    deps['expo-router'] && deps['zustand'] && deps['@tanstack/react-query'],
  ),
);
check(
  'Đã cài reanimated, worklets, gesture-handler',
  Boolean(
    deps['react-native-reanimated'] &&
    deps['react-native-worklets'] &&
    deps['react-native-gesture-handler'],
  ),
);
check(
  'Đã cài nativewind, react-hook-form, zod',
  Boolean(deps['nativewind'] && deps['react-hook-form'] && deps['zod']),
);
check(
  'Có đủ 6 file route trong src/app/',
  exists('src/apps/mobile/src/app/_layout.tsx') &&
    exists('src/apps/mobile/src/app/index.tsx') &&
    exists('src/apps/mobile/src/app/login.tsx') &&
    exists('src/apps/mobile/src/app/game.tsx') &&
    exists('src/apps/mobile/src/app/history.tsx') &&
    exists('src/apps/mobile/src/app/leaderboard.tsx'),
);
check(
  '_layout.tsx bọc GestureHandlerRootView & QueryClientProvider',
  layoutSrc.includes('GestureHandlerRootView') &&
    layoutSrc.includes('QueryClientProvider'),
);
check(
  'Có auth.schema.ts & LoginScreen dùng useForm + zodResolver',
  exists('src/apps/mobile/src/schemas/auth.schema.ts') &&
    loginSrc.includes('useForm') &&
    loginSrc.includes('zodResolver'),
);

console.log(
  '\n=== 4. MỤC 3.4 — KIẾN TRÚC HOOKS - SERVICES - CORE & PURE STORES ===',
);
const gameStoreSrc = readText('src/apps/mobile/src/store/game.store.ts');
const gameScreenSrc = readText('src/apps/mobile/src/screens/GameScreen.tsx');

check(
  'Có tầng core/http (client, interceptors) & core/socket',
  exists('src/apps/mobile/src/core/http/client.ts') &&
    exists('src/apps/mobile/src/core/http/interceptors.ts') &&
    exists('src/apps/mobile/src/core/socket/socket.client.ts'),
);
check(
  'Có đủ 4 file services/ (auth, game, history, leaderboard)',
  exists('src/apps/mobile/src/services/auth.service.ts') &&
    exists('src/apps/mobile/src/services/game.service.ts') &&
    exists('src/apps/mobile/src/services/history.service.ts') &&
    exists('src/apps/mobile/src/services/leaderboard.service.ts'),
);
check(
  'Có đủ 3 file hooks/ (useAuth, useGame, useHistory)',
  exists('src/apps/mobile/src/hooks/useAuth.ts') &&
    exists('src/apps/mobile/src/hooks/useGame.ts') &&
    exists('src/apps/mobile/src/hooks/useHistory.ts'),
);
check(
  'game.store.ts thuần state (không import chéo auth/history store)',
  !gameStoreSrc.includes('useAuthStore') &&
    !gameStoreSrc.includes('useHistoryStore'),
);
check(
  'GameScreen.tsx gọi useGame() thay vì useGameStore()',
  gameScreenSrc.includes('useGame') && !gameScreenSrc.includes('useGameStore'),
);

console.log('\n=== 5. DTO & MAPPERS (CHUẨN BỊ NỐI API) ===');
check(
  'Có đủ 4 file *.dto.ts trong src/types/',
  exists('src/apps/mobile/src/types/auth.dto.ts') &&
    exists('src/apps/mobile/src/types/game.dto.ts') &&
    exists('src/apps/mobile/src/types/history.dto.ts') &&
    exists('src/apps/mobile/src/types/leaderboard.dto.ts'),
);
check(
  'Có đủ 4 file *.mapper.ts trong src/mappers/',
  exists('src/apps/mobile/src/mappers/auth.mapper.ts') &&
    exists('src/apps/mobile/src/mappers/game.mapper.ts') &&
    exists('src/apps/mobile/src/mappers/history.mapper.ts') &&
    exists('src/apps/mobile/src/mappers/leaderboard.mapper.ts'),
);

console.log('\n==============================');
console.log(`KẾT QUẢ: ${passed}/${passed + failed} đạt | ${failed} lỗi`);
if (failed > 0) process.exit(1);
