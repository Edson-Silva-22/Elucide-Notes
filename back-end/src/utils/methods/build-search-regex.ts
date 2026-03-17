export function buildSearchRegex(keyword: string) {
  const key = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return new RegExp(
    key
      .split('')
      .map((c) => {
        const mapa = {
          a: '[aáàâã]',
          e: '[eéèê]',
          i: '[iíìî]',
          o: '[oóòôõ]',
          u: '[uúùû]',
          c: '[cç]',
          A: '[AÁÀÂÃ]',
          E: '[EÉÈÊ]',
          I: '[IÍÌÎ]',
          O: '[OÓÒÔÕ]',
          U: '[UÚÙÛ]',
          C: '[CÇ]',
        };
        return mapa[c] || c;
      })
      .join(''),
    'i',
  );
}