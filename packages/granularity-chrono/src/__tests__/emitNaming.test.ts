import { defineEmitNamingGate } from '@feugene/granularity-test-kit/gates'

/**
 * Нейминг эмитов — общей фабрикой: правило одно на все пакеты, а экземпляры
 * расходились (у charts и dashboard файлы были побайтово одинаковы, у ядра
 * отставали на два символа, у chrono гейта не было вовсе).
 */
defineEmitNamingGate()
