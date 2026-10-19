import { ref, watch } from 'vue'

const FIT_KEY = 'gr-design-board-fit'

function readFit(): boolean {
  try {
    return localStorage.getItem(FIT_KEY) !== 'actual'
  }
  catch {
    return true
  }
}

/** Масштаб макетов — общий на все вкладки и запоминается между визитами. */
export const boardFit = ref(readFit())

watch(boardFit, (fit) => {
  try {
    localStorage.setItem(FIT_KEY, fit ? 'fit' : 'actual')
  }
  catch {
    // Приватный режим и запрет хранилища — не повод ломать переключатель.
  }
})
