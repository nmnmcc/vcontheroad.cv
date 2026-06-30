import * as migration_20260420_200714 from './20260420_200714';
import * as migration_20260421_134352 from './20260421_134352';
import * as migration_20260422_024322 from './20260422_024322';
import * as migration_20260422_034745 from './20260422_034745';
import * as migration_20260422_081303 from './20260422_081303';

export const migrations = [
  {
    up: migration_20260420_200714.up,
    down: migration_20260420_200714.down,
    name: '20260420_200714',
  },
  {
    up: migration_20260421_134352.up,
    down: migration_20260421_134352.down,
    name: '20260421_134352',
  },
  {
    up: migration_20260422_024322.up,
    down: migration_20260422_024322.down,
    name: '20260422_024322',
  },
  {
    up: migration_20260422_034745.up,
    down: migration_20260422_034745.down,
    name: '20260422_034745',
  },
  {
    up: migration_20260422_081303.up,
    down: migration_20260422_081303.down,
    name: '20260422_081303'
  },
];
