# Publicação do site

## 1. Preencher os dados que faltam

Procure e substitua nos arquivos (Ctrl+Shift+H no VS Code):

| Placeholder | Onde | Exemplo |
|---|---|---|
| `[NUMERO_COM_DDI]` | index.html e `CONFIG.whatsappNumber` em js/main.js | `5565999999999` |
| `[NUMERO_FORMATADO]` | index.html (contato) | `(65) 99999-9999` |
| `[ENDERECO]` | index.html e politica-de-privacidade.html | `Av. Exemplo, 123, sala 4` |
| `[HORARIO]` | index.html (contato) | `Segunda a sexta, das 9h às 18h` |
| `[HORARIO_SCHEMA ex.: Mo-Fr 09:00-18:00]` | index.html (JSON-LD) | `Mo-Fr 09:00-18:00` |
| `[URL_DO_SITE]` | index.html, robots.txt, sitemap.xml | `https://drajulianemendes.com.br` (sem barra no fim) |
| `[EMAIL_DE_CONTATO]` | politica-de-privacidade.html | `contato@...` |
| `[DATA_DA_PUBLICACAO]` | politica-de-privacidade.html | `28 de outubro de 2026` |
| `[DEPOIMENTO REAL]`, `[NOME OU INICIAIS]`, `[PROCEDIMENTO]` | index.html (depoimentos) | relatos reais e autorizados |

No mapa (index.html, seção Contato), troque `q=Cuiab%C3%A1%20-%20MT` pelo endereço completo.

Ainda sem foto: o **hero** (topo do site) mostra um fundo escuro. O comentário acima dele traz o código pronto para colar.

## 2. Gerar a pasta de publicação

```
node build.mjs
```

Cria a pasta `dist/` só com os arquivos do site (sem os originais da pasta `imagens/`)
e lista o que ainda não foi preenchido. Publique quando aparecer "Nenhuma pendência encontrada".
`node build.mjs --strict` faz o build falhar se houver pendências.

## 3. Publicar

- **Vercel (atual):** o repositório já tem `vercel.json`. Em vercel.com, clique em
  *Add New > Project*, importe o repositório do GitHub e clique em *Deploy* (não mude nenhuma
  configuração). A cada `git push` na branch `main`, a Vercel publica a versão nova sozinha.
- **Netlify / Cloudflare Pages:** arraste a pasta `dist/` no painel. O arquivo `_headers` já configura cache e segurança.
- **Hostinger, HostGator, Locaweb (Apache):** envie o conteúdo de `dist/` para `public_html/`. O `.htaccess` já força HTTPS, comprime e configura cache.

## 4. Depois de publicar

- Ative o HTTPS (certificado SSL gratuito) no painel da hospedagem.
- Envie `https://seudominio/sitemap.xml` no Google Search Console.
- Teste o link no WhatsApp: a prévia deve mostrar a imagem `assets/img/og-image.jpg`.
- Ao alterar CSS ou JS no futuro, troque `?v=3` por `?v=4` no index.html, para os visitantes receberem a versão nova.
- Revise a política de privacidade com um advogado.
