import { Directive, DirectiveBinding } from 'vue'

const focusDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    function myFocus() {
      if (el.classList.contains('mu-input')) {
        // 假設結構是固定的，確保 firstElementChild 存在
        const first = el.firstElementChild?.firstElementChild as HTMLElement | null
        first?.focus()
      } else {
        el.focus()
      }
    }

    if (binding.value !== undefined) {
      if (binding.value) myFocus()
    } else {
      myFocus()
    }
  }
}

export default focusDirective
