# Skill: Unit Test Controller (NestJS)

---

## 🎯 Objetivo

Gerar testes unitários completos para controllers no NestJS utilizando Jest, garantindo que:

* os endpoints delegam corretamente para o service
* parâmetros são repassados corretamente
* erros são propagados corretamente
* guards são mockados adequadamente

---

## 🧠 Quando usar

* Ao criar ou manter controllers no NestJS
* Ao validar integração entre controller e service
* Ao garantir comportamento correto dos endpoints

---

## 🚫 Quando NÃO usar

* Para testes E2E (usar supertest)
* Para testar lógica de negócio (isso é responsabilidade do service)
* Para validar banco de dados

---

## 📁 Contexto do repositório

```id="ctx1"
/front-end
/back-end
/docs
  /skills
```

⚠️ Todos os arquivos gerados devem estar dentro de `back-end/`

---

## 📥 Inputs esperados

### Obrigatório

* `controller_path`

Exemplo:

```id="in1"
back-end/src/modules/users/users.controller.ts
```

---

### Opcional

#### `regras_de_negocio`

Regras adicionais não explícitas no controller

Exemplo:

```id="in2"
- endpoint me deve usar o id do usuário autenticado
```

---

#### `overrides`

```json id="in3"
{
  "module": "users",
  "service": "UsersService"
}
```

---

## 🧠 Resolução automática de contexto

A IA deve inferir:

* module → a partir do caminho (`src/modules/<module>/`)
* controller name → nome da classe
* service → via constructor ou a partir do caminho (`src/modules/<module>/<module>.service.ts`)
* métodos → parsing da classe
* DTOs → via decorators (@Body, etc) ou a partir do caminho (`src/modules/<module>/dto/`)
* guards → via decorators (@UseGuards)

---

## 📁 Estrutura de arquivos

Gerar:

```id="path1"
back-end/src/modules/<module>/tests/unit/<module>.controller.spec.ts
```

Mocks devem estar em:

```id="path2"
back-end/src/modules/<module>/tests/mocks/<module>.mocks.ts
```

---

## ⚙️ Estratégia de execução

### 1. Criar módulo de teste

```ts
const module: TestingModule = await Test.createTestingModule({
  controllers: [Controller],
  providers: [
    {
      provide: Service,
      useValue: mockService,
    }
  ]
})
```

---

### 2. Mocks

Sempre sobrescrever guards:

```ts
.overrideGuard(AuthGuard)
.useValue({ canActivate: jest.fn().mockReturnValue(true) })

.overrideGuard(AuthorizationGuard)
.useValue({ canActivate: jest.fn().mockReturnValue(true) })
```

Também gerar mocks necessários no arquivo `mocks/<module>.mocks.ts`:
* entityMock
* DTO mocks (se identificados)
---

### 3. Estrutura base

```ts
describe('<ControllerName>', () => {
  let controller: Controller;
  let service: Service;

  beforeAll(...)
  afterEach(() => jest.clearAllMocks())

  it('should be defined', ...)
})
```

---

### 4. Padrão de testes por método

Para cada método:

#### ✅ Sucesso

* service mockado com `mockResolvedValue`
* valida chamada
* valida retorno

#### ❌ Erro de negócio

* service lança erro esperado
* controller deve propagar erro

#### 💥 Erro interno

* service lança erro interno
* controller deve propagar erro

---

### 5. Delegação obrigatória

Controller NÃO deve conter lógica.

Sempre validar:

```ts
expect(service.method).toHaveBeenCalledTimes(1)
expect(service.method).toHaveBeenCalledWith(...)
```

---

### 6. Tratamento de erros

```ts
await expect(controller.method()).rejects.toThrow(Exception)
```

---

## 📏 Regras e boas práticas

* Controller NÃO deve ter lógica de negócio
* Sempre mockar service
* Sempre mockar guards
* Testar apenas delegação e retorno
* Não testar implementação interna do service

---

## 🧪 Exemplos

### Create

```ts
it('should create a new entity', async () => {
  (service.create as jest.Mock).mockResolvedValue(data);

  const result = await controller.create(dto);

  expect(service.create).toHaveBeenCalledWith(dto);
  expect(result).toEqual(data);
});
```

---

### Error

```ts
it('should throw error', async () => {
  (service.create as jest.Mock).mockRejectedValue(new BadRequestException());

  await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
});
```

---

### Auth-based method

```ts
it('should use authenticated user id', async () => {
  (service.findOne as jest.Mock).mockResolvedValue(user);

  const result = await controller.me(authUserMock);

  expect(service.findOne).toHaveBeenCalledWith(authUserMock.sub);
});
```

---

## 🔁 Variações / edge cases

* Métodos com @Param
* Métodos com @Query
* Métodos com @Body
* Métodos com usuário autenticado
* Controllers com múltiplos guards

---

## 🚀 Regra de ouro

Cada método DEVE ter:

* 1 teste de sucesso
* 1 teste de erro de negócio
* 1 teste de erro interno

---

## ⚡ Exemplos de Execução

### Input mínimo

```id="exec1"
Use a skill: docs/skills/unit-test-controller.md

Input:
- controller_path: back-end/src/modules/users/users.controller.ts
```

---

### Input com regras

```id="exec2"
Input:
- controller_path: back-end/src/modules/users/users.controller.ts

- regras_de_negocio:
  - endpoint me deve usar o id do usuário autenticado
```

---

## 🧠 Filosofia

* Controller = camada de orquestração
* Teste = validação de delegação
* Service = fonte da lógica
* Guards = sempre mockados

---