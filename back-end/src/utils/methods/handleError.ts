import { HttpException, InternalServerErrorException } from "@nestjs/common"

export function handleError(error: unknown) {
  console.error(error)
  if (error instanceof HttpException) throw error
  throw new InternalServerErrorException('Erro interno do servidor. Tente novamente mais tarde.')
}