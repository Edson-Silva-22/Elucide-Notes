<template>
  <v-sheet 
    class="mx-2 pa-4" 
    elevation="0" 
    rounded
    style="margin-bottom: 50px;"
  >
    <div 
      :class="{
        'bottom-navigation': display.smAndDown.value,
        'mb-4': !display.smAndDown.value
      }"
    >
      <v-slide-group>
        <v-slide-group-item 
          v-for="(editorTool, index) in editorTools"
          :key="index"
        >
          <v-sheet 
            v-for="item in editorTool" 
            :key="item.title"
            class="bg-background"
            height="50"
          >
            <v-menu
              v-if="item.menuVariants && item.menuVariants.length > 0"
              location="bottom end"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  :icon="item.icon"
                  v-bind="props"
                  size="small"
                  rounded="0"
                  height="100%"
                  variant="tonal"
                  :color="item.activeValue && isActive(item) ? 'primary' : ''"
                ></v-btn>
              </template>

              <v-list class="pa-0">
                <v-list-item
                  v-for="(value, index) in item.menuVariants"
                  :key="index"
                  :value="value.value"
                  :prepend-icon="value.icon"
                  :title="value.title"
                  prepend-gap="10"
                  @click="value.run(); item.activeValue = value.value"
                  :class="isActive({ ...item, activeValue: value.value }) ? 'bg-primary' : ''"
                ></v-list-item>
              </v-list>
            </v-menu>
            
            <v-btn
              v-else
              :icon="item.icon"
              size="small"
              rounded="0"
              height="100%"
              variant="tonal"
              @click="item.run"
              :color="isActive(item) ? 'primary' : ''"
            ></v-btn>
          </v-sheet>
        </v-slide-group-item>
      </v-slide-group>
  </div>

    <div 
      class="text-body-1 text-break pa-0"
    >
      <EditorContent :editor="editor" class="tiptap-editor"/>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
  import { Editor, EditorContent, type EditorOptions } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  import { TaskItem, TaskList } from '@tiptap/extension-list';
  import TextAlign from '@tiptap/extension-text-align';
  import Highlight from '@tiptap/extension-highlight'
  import { useDisplay } from 'vuetify';

  interface EditorTools {
    title: string
    icon: string
    activeValue?: {
      name?: string,
      attributes?: Record<string, unknown>
    }
    run?: () => void,
    can?: () => boolean,
    menuVariants?: {
      title: string
      icon?: string
      value: {
        name?: string,
        attributes?: Record<string, unknown>
      }
      run: () => void
    }[]
  }

  const props = defineProps<{
    editorOptions: Partial<EditorOptions>
  }>()
  const emits = defineEmits(['editorUpdate'])

  const display = useDisplay()
  const editor = new Editor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: 'code-block elevation-4'
          }
        },
        code: {
          HTMLAttributes: {
            class: 'code-block elevation-4'
          }
        },
      }), 
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'highlight'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ...props.editorOptions?.extensions ?? []
    ],
    ...props.editorOptions
  })
  const textStructures:EditorTools[] = [
    {
      title: 'Título',
      icon: 'mdi-format-title',
      activeValue: {
        name: 'heading',
      },
      menuVariants: [
        {
          title: 'Título 1',
          value: {
            name: 'heading',
            attributes: {
              level: 1
            }
          },
          run: () => editor.chain().focus().toggleHeading({ level: 1 }).run()
        },
        {
          title: 'Título 2',
          value: {
            name: 'heading',
            attributes: {
              level: 2
            }
          },
          run: () => editor.chain().focus().toggleHeading({ level: 2 }).run()
        },
        {
          title: 'Título 3',
          value: {
            name: 'heading',
            attributes: {
              level: 3
            }
          },
          run: () => editor.chain().focus().toggleHeading({ level: 3 }).run()
        },
        {
          title: 'Título 4',
          value: {
            name: 'heading',
            attributes: {
              level: 4
            }
          },
          run: () => editor.chain().focus().toggleHeading({ level: 4 }).run()
        }
      ]
    },
    {
      title: 'Listas',
      icon: 'mdi-format-list-bulleted',
      activeValue: {
        name: 'bulletList'
      },
      menuVariants: [
        {
          title: 'Lista de Marcadores',
          icon: 'mdi-format-list-bulleted',
          value: {
            name: 'bulletList',
          },
          run: () => editor.chain().focus().toggleBulletList().run()
        },
        {
          title: 'Lista Numerada',
          icon: 'mdi-format-list-numbered',
          value: {
            name: 'orderedList',
          },
          run: () => editor.chain().focus().toggleOrderedList().run()
        },
        {
          title: 'Lista de Verificação',
          icon: 'mdi-format-list-checkbox',
          value: {
            name: 'taskList',
          },
          run: () => editor.chain().focus().toggleTaskList().run()
        }
      ]
    },
    {
      title: 'Bloco de Código',
      icon: 'mdi-code-block-tags',
      activeValue: {
        name: 'codeBlock'
      },
      run: () => editor.chain().focus().toggleCodeBlock().run()
    }
  ]
  const textFormating:EditorTools[] = [
    {
      title: 'Negrito',
      icon: 'mdi-format-bold',
      activeValue: {
        name: 'bold'
      },
      run: () => editor.chain().focus().toggleBold().run()
    },
    {
      title: 'Itálico',
      icon: 'mdi-format-italic',
      activeValue: {
        name: 'italic'
      },
      run: () => editor.chain().focus().toggleItalic().run()
    },
    {
      title: 'Sublinhado',
      icon: 'mdi-format-underline',
      activeValue: {
        name: 'underline'
      },
      run: () => editor.chain().focus().toggleUnderline().run()
    },
    {
      title: 'Riscado',
      icon: 'mdi-format-strikethrough',
      activeValue: {
        name: 'strike'
      },
      run: () => editor.chain().focus().toggleStrike().run()
    },
    {
      title: 'Código',
      icon: 'mdi-xml',
      activeValue: {
        name: 'code'
      },
      run: () => editor.chain().focus().toggleCode().run()
    },
    {
      title: 'Marcar',
      icon: 'mdi-marker',
      activeValue: {
        name: 'highlight',
      },
      run: () => editor.chain().focus().toggleHighlight().run()
    }
  ]
  const textAlignment:EditorTools[] = [
    {
      title: 'Alinhar à esquerda',
      icon: 'mdi-format-align-left',
      activeValue: {
        attributes: {
          textAlign: 'left'
        }
      },
      run: () => editor.chain().focus().setTextAlign('left').run()
    },
    {
      title: 'Alinhar ao centro',
      icon: 'mdi-format-align-center',
      activeValue: {
        attributes: {
          textAlign: 'center'
        }
      },
      run: () => editor.chain().focus().setTextAlign('center').run()
    },
    {
      title: 'Alinhar à direita',
      icon: 'mdi-format-align-right',
      activeValue: {
        attributes: {
          textAlign: 'right'
        }
      },
      run: () => editor.chain().focus().setTextAlign('right').run()
    },
    {
      title: 'Justificar',
      icon: 'mdi-format-align-justify',
      activeValue: {
        attributes: {
          textAlign: 'justify'
        }
      },
      run: () => editor.chain().focus().setTextAlign('justify').run()
    }
  ]
  const undoRedo: EditorTools[] = [
    {
      title: 'Desfazer',
      icon: 'mdi-undo',
      run: () => editor.chain().focus().undo().run(),
      can: () => editor.can().undo()
    },
    {
      title: 'Refazer',
      icon: 'mdi-redo',
      run: () => editor.chain().focus().redo().run(),
      can: () => editor.can().redo()
    }
  ]
  const editorTools = ref([
    undoRedo,
    textStructures,
    textFormating,
    textAlignment,
  ])

  const handleViewportChange = () => {
    if (!window.visualViewport) return

    const vv = window.visualViewport
    const viewportHeight = window.innerHeight
    
    // A distância do topo da visual viewport até o topo da página
    // somada à altura que o teclado ocupa
    let offset = viewportHeight - vv.height - vv.offsetTop
    offset = Math.max(0, offset)

    // Aplicamos diretamente no estilo do documento ou de um elemento pai
    document.documentElement.style.setProperty('--keyboard-offset', `${offset}px`)
  }

  function isActive(item: EditorTools) {
    if (item.activeValue && item.activeValue.name) {
      return editor.isActive(item.activeValue.name, item.activeValue.attributes)
    }

    if (item.activeValue && item.activeValue.attributes) return editor.isActive(item.activeValue.attributes)

    if (item.can) return item.can()

    return false
  }

  onMounted(() => {
    editor.on('update', () => {
      emits('editorUpdate', editor.getJSON())
    })

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      window.visualViewport.addEventListener('scroll', handleViewportChange)
    }
  })

  onBeforeUnmount(() => {
    editor.destroy()
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleViewportChange)
      window.visualViewport.removeEventListener('scroll', handleViewportChange)
    }
  })
</script>

<style scoped>
  :deep(.ProseMirror) {
    outline: none;
    border: none;
  }

  :deep(.ProseMirror:focus) {
    outline: none;
    box-shadow: none;
  }

  :deep(.tiptap-editor) ul[data-type="taskList"] {
    margin-top: 20px;
  }

  :deep(.tiptap-editor) ul[data-type="taskList"] li {
    display: flex;
    align-items: center;
    margin-top: 20px;
  }

  :deep(.tiptap-editor) ul[data-type="taskList"] li label {
    margin-right: 15px;
  }

  :deep(.tiptap-editor) ul[data-type="taskList"] li input[type="checkbox"] {
     /* removendo o estilo padrão */
    appearance: none;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    cursor: pointer;
    border: 2px solid rgb(var(--v-theme-primary)); /* cor quando DESMARCADO */
    border-radius: 4px;
    background: transparent;
    display: block;
    position: relative;
  }

  :deep(.tiptap-editor) ul[data-type="taskList"] li input[type="checkbox"]:checked {
    background: rgb(var(--v-theme-primary));
    border-color: rgb(var(--v-theme-primary));
  }

  :deep(.tiptap-editor) ul[data-type="taskList"] li input[type="checkbox"]:checked::after {
    content: '✔';
    color: white;
    font-size: 14px;
    position: absolute;
    top: -2px;
    left: 2px;
  }

  :deep(.tiptap-editor) ol li {
    margin: 20px 0  20px 20px;
  }

  :deep(.tiptap-editor) ul:not([data-type='taskList']) li {
    margin: 20px 0 20px 20px;
  }

  :deep(.code-block) {
    padding: 10px;
    background-color: #18181B;
    border-radius: 5px;
    color: white;
    font-size: 14px;
  }

  :deep(.highlight) {
    background-color: rgb(var(--v-theme-primary));
    color: white;
    padding: 3px;
    border-radius: 2px;
  }

  .hide-scrollbar {
    scrollbar-width: none;      /* Firefox */
    -ms-overflow-style: none;   /* IE / Edge antigo */
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;              /* Chrome, Safari, Edge */
  }

  .bottom-navigation {
    /* Forçamos o componente a ignorar o bottom: 0 padrão do Vuetify */
    bottom: var(--keyboard-offset, 0px) !important;
    position: fixed !important;
    transition: none !important; /* Evita o efeito de 'pulo' ao rolar */
    width: 100%;
    z-index: 1000;
    background-color: rgb(var(--v-theme-background));
    display: flex;
    justify-content: center;
    align-items: center;
    bottom: 0px;
    left: 0px;
  }
</style>