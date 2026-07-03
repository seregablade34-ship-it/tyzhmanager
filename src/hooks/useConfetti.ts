import confetti from 'canvas-confetti'

// 🎉 Стандартный салют (выполнение задачи)
export function fireTaskConfetti() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#2563EB', '#22C55E', '#F59E0B'],
  })
}

// 🏆 Большой салют (достижение разблокировано)
export function fireAchievementConfetti() {
  const duration = 2000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'],
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'],
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}

// 🎯 Мощный салют (цель выполнена!)
export function fireGoalConfetti() {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#FFD700', '#FFA500', '#FF6347', '#2563EB', '#22C55E'],
  }

  confetti({ ...defaults, particleCount: 50, scalar: 1.2, shapes: ['circle', 'square'] })

  setTimeout(() => {
    confetti({ ...defaults, particleCount: 30, scalar: 0.75, shapes: ['circle'] })
  }, 300)

  setTimeout(() => {
    confetti({ ...defaults, particleCount: 40, scalar: 1, shapes: ['square'] })
  }, 600)
}

// 🔥 Комбо-салют (серия дней)
export function fireComboConfetti(comboCount: number) {
  const intensity = Math.min(comboCount * 5, 100)

  confetti({
    particleCount: intensity,
    spread: 70 + Math.min(comboCount * 2, 40),
    origin: { y: 0.6 },
    colors: ['#FF6B35', '#FF4500', '#FFD700', '#FF8C00'],
  })
}