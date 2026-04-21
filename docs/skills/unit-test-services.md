# Skill: Unit Test Service (NestJS + Mongoose)

---

## 🎯 Objetivo

Gerar testes unitários completos para services no NestJS utilizando Jest, com mocks automáticos de dependências (Mongoose, bcrypt, etc.), cobrindo fluxos de sucesso, regras de negócio e exceções.

---

## 🧠 Quando usar

* Ao criar ou manter services no NestJS
* Ao implementar CRUD com Mongoose
* Ao validar regras de negócio isoladamente
* Ao garantir cobertura de exceções

---

## 🚫 Quando NÃO usar

* Para testes E2E (usar supertest)
* Para testes de controllers
* Quando precisar validar integração com banco real

---

## 📁 Contexto do repositório

A skill está localizada em:

```
docs/skills/unit-test-service.md
```

Estrutura do projeto:

```
/front-end
/back-end
/docs
  /skills
```

⚠️ Todos os arquivos gerados devem ser criados dentro de `back-end/`

---

## 📥 Inputs esperados

### Obrigatório

* `service_path`: caminho absoluto do service

Exemplo:

```
back-end/src/modules/users/services/users.service.ts
```

---

### Opcional

#### `regras_de_negocio`

Regras que não são facilmente inferidas do código

Exemplo:

```
- email deve ser único
- admin não pode ser deletado
```

---

#### `overrides`

Permite corrigir ou complementar inferências da IA

```json
{
  "module": "users",
  "entity": "user",
  "dependencies": ["userModel"]
}
```

---

## 🧠 Resolução automática de contexto

A IA deve inferir automaticamente:

* **module** → a partir do caminho (`src/modules/<module>/`)
* **entity** → nome do model injetado ou nome do arquivo
* **service name** → nome da classe
* **métodos** → parsing da classe
* **DTOs** → a partir do caminho (`src/modules/<module>/dto/`)
* **dependências** → via constructor

---

## 📁 Estrutura de arquivos (geração)

Baseado no `service_path`, gerar:

* Teste:

```
back-end/src/modules/<module>/tests/unit/<module>.service.spec.ts
```

* Mocks:

```
back-end/src/modules/<module>/tests/mocks/<module>.mocks.ts
```

---

## ⚙️ Estratégia de execução

### 1. Analisar o service

* Ler o arquivo informado em `service_path`
* Identificar:

  * métodos públicos
  * dependências do constructor
  * uso de DTOs
  * regras explícitas (if/throw)

---

### 2. Inferir dependências

Exemplo:

```ts
constructor(
  @InjectModel(User.name) private userModel: Model<User>,
  private emailService: EmailService
)
```

Deve gerar mocks para:

* userModel
* emailService

---

### 3. Criar mocks

Arquivo: `mocks/<module>.mocks.ts`

```ts
export const mockModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
};
```

Gerar também:

* entityMock
* DTO mocks (se identificados)

---

### 4. Criar setup do teste

```ts
const module: TestingModule = await Test.createTestingModule({
  providers: [
    Service,
    {
      provide: getModelToken(Entity.name),
      useValue: mockModel,
    }
  ]
}).compile();
```

---

### 5. Gerar testes por método

Para cada método:

#### ✅ Sucesso

* fluxo principal
* retorno correto

#### ❌ Regra de negócio

* baseado em:

  * código (if/throw)
  * `regras_de_negocio` (input)

#### 💥 Erro interno

* simular erro no model/dependência

---

### 6. Padrões obrigatórios

#### Mock de query encadeada (Mongoose)

```ts
mockModel.find.mockReturnValue({
  select: jest.fn().mockResolvedValue(...)
});
```

---

#### Validação de chamadas

```ts
expect(mockModel.method).toHaveBeenCalledTimes(1);
expect(mockModel.method).toHaveBeenCalledWith(...);
```

---

#### Erros async

```ts
await expect(service.method()).rejects.toThrow(Exception);
```

---

#### Limpeza

```ts
afterEach(() => {
  jest.clearAllMocks();
});
```

---

## 📏 Regras e boas práticas

* Nunca usar banco real
* Mockar TODAS dependências externas
* Não assumir comportamento implícito sem evidência
* Priorizar código do service como fonte de verdade
* Usar `regras_de_negocio` como complemento
* Não duplicar lógica do service no teste

---

## 🧪 Exemplos de geração

```ts
describe('Create Method', () => {
  it('should create successfully', ...)
  it('should throw if email already exists', ...)
  it('should handle internal error', ...)
});
```

---

## 🔁 Variações / edge cases

* Hash de senha com bcrypt
* Métodos com `.toObject()`
* Dependências múltiplas
* Métodos com validações encadeadas
* Services com lógica condicional complexa

---

## 🚀 Regra de ouro

Cada método DEVE ter:

* 1 teste de sucesso
* 1 teste de regra de negócio
* 1 teste de erro interno

---

## ⚡ Exemplos de Execução da skill

### Input mínimo

```
Use a skill: docs/skills/unit-test-service.md

Input:
- service_path: back-end/src/modules/users/services/users.service.ts
```

---

### Input com regras adicionais

```
Input:
- service_path: back-end/src/modules/users/services/users.service.ts
- regras_de_negocio:
  - admin não pode ser deletado
```

---

### Input com override

```
Input:
- service_path: ...
- overrides:
  entity: user
```

---

## 🧠 Filosofia da skill

* Código é a fonte primária de verdade
* Inputs são apenas complementares
* Inferência deve ser priorizada
* Overrides existem para garantir controle

---
