async function checkCategory(slug) {
  const res = await fetch(`https://audifydj.vercel.app/songs/${slug}`);
  const text = await res.text();
  const count = (text.match(/<li class="flex items-baseline/g) || []).length;
  const ytLinks = (text.match(/href="https:\/\/www\.youtube\.com\/watch/g) || []).length;
  console.log(`${slug.padEnd(30)}: status ${res.status}, ${count} songs, ${ytLinks} working YouTube hook links`);
}

await checkCategory('hindi-sufi');
await checkCategory('hindi-hiphop');
await checkCategory('tamil-telugu-kuthu');
await checkCategory('gujarati-garba');
await checkCategory('english-edm');
