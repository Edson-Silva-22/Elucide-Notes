
# Aplicação de Soft Delete no Módulo de Tags

## Descrição

O objetivo desta tarefa é implementar o fluxo de **soft delete** no módulo de tags, garantindo que tags removidas não sejam excluídas fisicamente do banco de dados, mas marcadas como inativas.

## Checklist

### Back-end

- [x] Adicionar o campo `active` na entidade `Tag`, localizada no arquivo `tag.entity.ts`.
  - O campo deve ser do tipo `boolean`.
  - O valor padrão (`default`) deve ser `true`.

- [x] Alterar os métodos `findAll`, `findOne` e `update` no arquivo `tags.service.ts` para considerar apenas tags ativas (`active: true`).

- [x] Alterar o método `remove` no arquivo `tags.service.ts` para aplicar o soft delete através da atualização do campo `active` para `false`, ao invés de remover o documento do banco de dados.

### Testes

- [x] Atualizar os mocks necessários no arquivo `tags.mocks.ts` para refletir as alterações realizadas na entidade `Tag`.

- [x] Atualizar os testes E2E no arquivo `tags.e2e.spec.ts` para validar corretamente o novo fluxo de soft delete.

- [x] Garantir que os testes E2E cubram os seguintes cenários:
  - Tags removidas não devem ser retornadas nas listagens.
  - Tags removidas não devem ser encontradas pelo `findOne`.
  - Tags removidas não devem ser atualizadas.
  - O método `remove` deve apenas alterar o campo `active` para `false`.