export function chunkText(text: string, maxChars=800, overlap=120){
  const out: string[] = [];
  const clean = text.replace(/\r/g,'').replace(/\t/g,' ').replace(/ +/g,' ').trim();
  let i = 0;
  while(i < clean.length){
    let end = Math.min(i + maxChars, clean.length);
    const slice = clean.slice(i, end);
    const lastDot = slice.lastIndexOf('. ');
    const cut = (lastDot > maxChars * 0.5) ? (i + lastDot + 1) : end;
    out.push(clean.slice(i, cut).trim());
    i = Math.max(cut - overlap, i + 1);
  }
  return out.filter(Boolean);
}