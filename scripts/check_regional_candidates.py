with open('scripts/curate_agent_7_batches.py', 'r', encoding='utf-8') as f:
    text = f.read()

idx_marwadi = text.find('MARWADI_SONGS')
print('curate_agent_7: Marathi titles:', text[:idx_marwadi].count('"title":'), 'Marwadi titles:', text[idx_marwadi:].count('"title":'))

with open('scripts/generate_agent_8_200.py', 'r', encoding='utf-8') as f:
    text8 = f.read()
idx_odia = text8.find('ODIA_CANDIDATES')
print('generate_agent_8: Kannada titles:', text8[:idx_odia].count('"title":'), 'Odia titles:', text8[idx_odia:].count('"title":'))
