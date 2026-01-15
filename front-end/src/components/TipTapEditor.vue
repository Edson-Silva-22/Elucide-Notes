<template>
  <v-sheet class="mx-2 pa-4 mb-14" elevation="0">
    <div 
      v-if="!display.smAndDown.value"
      :class="`overflow-auto`" 
      style="border-radius: 5px;"
    >
      <div 
        class="d-flex align-center ga-2" 
        style="width: fit-content;"
      >
        <v-btn-toggle
          variant="tonal"
          color="primary"
          mandatory
          v-model="textStructureActived"
        >
          <template v-for="item in textStructures">
            <v-menu
              v-if="item.menuVariants && item.menuVariants.length > 0"
              location="bottom end"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  :icon="item.icon"
                  v-bind="props"
                  size="small"
                ></v-btn>
              </template>
    
              <v-list>
                <v-list-item
                  v-for="(value, index) in item.menuVariants"
                  :key="index"
                  :prepend-icon="value.icon"
                  :title="value.title"
                  prepend-gap="10"
                  @click="value.run()"
                ></v-list-item>
              </v-list>
            </v-menu>
            
            <v-btn
              v-else
              :icon="item.icon"
              v-bind="props"
              size="small"
              @click="item.run"
            ></v-btn>
          </template>
        </v-btn-toggle>
  
        <v-btn-toggle
          multiple
          variant="tonal"
          color="primary"
        >
          <template v-for="item in textFormating">
            <v-menu
              v-if="item.menuVariants && item.menuVariants.length > 0"
              location="bottom end"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  :icon="item.icon"
                  v-bind="props"
                  size="small"
                ></v-btn>
              </template>
    
              <v-list>
                <v-list-item
                  v-for="(value, index) in item.menuVariants"
                  :key="index"
                  :prepend-icon="value.icon"
                  :title="value.title"
                  prepend-gap="10"
                  @click="value.run()"
                ></v-list-item>
              </v-list>
            </v-menu>
            
            <v-btn
              v-else
              :icon="item.icon"
              v-bind="props"
              size="small"
              @click="item.run"
            ></v-btn>
          </template>
        </v-btn-toggle>
  
        <v-btn-toggle
          variant="tonal"
          color="primary"
          mandatory
        >
          <template v-for="item in textAlignment">
            <v-menu
              v-if="item.menuVariants && item.menuVariants.length > 0"
              location="bottom end"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  :icon="item.icon"
                  v-bind="props"
                  size="small"
                ></v-btn>
              </template>
    
              <v-list>
                <v-list-item
                  v-for="(value, index) in item.menuVariants"
                  :key="index"
                  :prepend-icon="value.icon"
                  :title="value.title"
                  prepend-gap="10"
                  @click="value.run()"
                ></v-list-item>
              </v-list>
            </v-menu>
            
            <v-btn
              v-else
              :icon="item.icon"
              v-bind="props"
              size="small"
              @click="item.run"
            ></v-btn>
          </template>
        </v-btn-toggle>
      </div>
    </div>

    <p 
      class="text-body-1 text-break pa-0 mt-4"
    >
      <EditorContent :editor="editor" class="tiptap-editor"/>
    </p>
  </v-sheet>

  <div 
    class="bottom-navigation"
    v-if="display.smAndDown.value"
  >
    <div 
      :class="`overflow-auto hide-scrollbar`" 
      style="border-radius: 5px;"
    >
      <div 
        class="d-flex align-center ga-2" 
        style="width: fit-content;"
      >
        <v-btn-toggle
          variant="tonal"
          color="primary"
          mandatory
          v-model="textStructureActived"
        >
          <template v-for="item in textStructures">
            <v-menu
              v-if="item.menuVariants && item.menuVariants.length > 0"
              location="bottom end"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  :icon="item.icon"
                  v-bind="props"
                  size="small"
                ></v-btn>
              </template>
    
              <v-list>
                <v-list-item
                  v-for="(value, index) in item.menuVariants"
                  :key="index"
                  :prepend-icon="value.icon"
                  :title="value.title"
                  prepend-gap="10"
                  @click="value.run()"
                ></v-list-item>
              </v-list>
            </v-menu>
            
            <v-btn
              v-else
              :icon="item.icon"
              v-bind="props"
              size="small"
              @click="item.run"
            ></v-btn>
          </template>
        </v-btn-toggle>
  
        <v-btn-toggle
          multiple
          variant="tonal"
          color="primary"
        >
          <template v-for="item in textFormating">
            <v-menu
              v-if="item.menuVariants && item.menuVariants.length > 0"
              location="bottom end"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  :icon="item.icon"
                  v-bind="props"
                  size="small"
                ></v-btn>
              </template>
    
              <v-list>
                <v-list-item
                  v-for="(value, index) in item.menuVariants"
                  :key="index"
                  :prepend-icon="value.icon"
                  :title="value.title"
                  prepend-gap="10"
                  @click="value.run()"
                ></v-list-item>
              </v-list>
            </v-menu>
            
            <v-btn
              v-else
              :icon="item.icon"
              v-bind="props"
              size="small"
              @click="item.run"
            ></v-btn>
          </template>
        </v-btn-toggle>
  
        <v-btn-toggle
          variant="tonal"
          color="primary"
          mandatory
        >
          <template v-for="item in textAlignment">
            <v-menu
              v-if="item.menuVariants && item.menuVariants.length > 0"
              location="bottom end"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  :icon="item.icon"
                  v-bind="props"
                  size="small"
                ></v-btn>
              </template>
    
              <v-list>
                <v-list-item
                  v-for="(value, index) in item.menuVariants"
                  :key="index"
                  :prepend-icon="value.icon"
                  :title="value.title"
                  prepend-gap="10"
                  @click="value.run()"
                ></v-list-item>
              </v-list>
            </v-menu>
            
            <v-btn
              v-else
              :icon="item.icon"
              v-bind="props"
              size="small"
              @click="item.run"
            ></v-btn>
          </template>
        </v-btn-toggle>
      </div>
    </div>
  </div>
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
    run?: () => void
    menuVariants?: {
      title: string
      icon?: string
      run: () => void
    }[]
  }

  const props = defineProps<{
    editorOptions: Partial<EditorOptions>
  }>()
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
  const textStructureActived = ref('')
  const textStructures = ref<EditorTools[]>([
    {
      title: 'Título',
      icon: 'mdi-format-title',
      menuVariants: [
        {
          title: 'Título 1',
          run: () => editor.chain().focus().toggleHeading({ level: 1 }).run()
        },
        {
          title: 'Título 2',
          run: () => editor.chain().focus().toggleHeading({ level: 2 }).run()
        },
        {
          title: 'Título 3',
          run: () => editor.chain().focus().toggleHeading({ level: 3 }).run()
        },
        {
          title: 'Título 4',
          run: () => editor.chain().focus().toggleHeading({ level: 4 }).run()
        }
      ]
    },
    {
      title: 'Listas',
      icon: 'mdi-format-list-bulleted',
      menuVariants: [
        {
          title: 'Lista de Marcadores',
          icon: 'mdi-format-list-bulleted',
          run: () => editor.chain().focus().toggleBulletList().run()
        },
        {
          title: 'Lista Numerada',
          icon: 'mdi-format-list-numbered',
          run: () => editor.chain().focus().toggleOrderedList().run()
        },
        {
          title: 'Lista de Verificação',
          icon: 'mdi-format-list-checkbox',
          run: () => editor.chain().focus().toggleTaskList().run()
        }
      ]
    },
    {
      title: 'Bloco de Código',
      icon: 'mdi-code-block-tags',
      run: () => editor.chain().focus().toggleCodeBlock().run()
    }
  ])
  const textFormating = ref<EditorTools[]>([
    {
      title: 'Negrito',
      icon: 'mdi-format-bold',
      run: () => editor.chain().focus().toggleBold().run()
    },
    {
      title: 'Itálico',
      icon: 'mdi-format-italic',
      run: () => editor.chain().focus().toggleItalic().run()
    },
    {
      title: 'Sublinhado',
      icon: 'mdi-format-underline',
      run: () => editor.chain().focus().toggleUnderline().run()
    },
    {
      title: 'Riscado',
      icon: 'mdi-format-strikethrough',
      run: () => editor.chain().focus().toggleStrike().run()
    },
    {
      title: 'Código',
      icon: 'mdi-xml',
      run: () => editor.chain().focus().toggleCode().run()
    },
    {
      title: 'Marcar',
      icon: 'mdi-marker',
      run: () => editor.chain().focus().toggleHighlight().run()
    },
    {
      title: 'Link',
      icon: 'mdi-link',
      run: () => editor.chain().focus().toggleLink().run()
    }
  ])
  const textAlignment = ref<EditorTools[]>([
    {
      title: 'Alinhar à esquerda',
      icon: 'mdi-format-align-left',
      run: () => editor.chain().focus().setTextAlign('left').run()
    },
    {
      title: 'Alinhar ao centro',
      icon: 'mdi-format-align-center',
      run: () => editor.chain().focus().setTextAlign('center').run()
    },
    {
      title: 'Alinhar à direita',
      icon: 'mdi-format-align-right',
      run: () => editor.chain().focus().setTextAlign('right').run()
    },
    {
      title: 'Justificar',
      icon: 'mdi-format-align-justify',
      run: () => editor.chain().focus().setTextAlign('justify').run()
    }
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

  onMounted(() => {
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      window.visualViewport.addEventListener('scroll', handleViewportChange)
    }
  })

  onBeforeUnmount(() => {
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
    touch-action: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .bottom-navigation > div {
    touch-action: pan-x; /* Permite scroll horizontal explicitamente */
    display: flex;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch; /* Scroll suave no iOS */
  }
</style>