import re
import unicodedata

# Abre o arquivo
with open(r'c:\Users\super\projetos\letrAZ\src\palavras.txt', 'r', encoding='utf-8') as file:
    texto = file.read()

# Pega todas as palavras
palavras = re.findall(r'\b\w+\b', texto)

# Filtra palavras com mais de 3 letras
palavras_filtradas = [palavra for palavra in palavras if len(palavra) == 5]

# Remove duplicatas
palavras_unicas = list(set(palavras_filtradas))

def remover_acentos(palavra):
    return ''.join(
        c for c in unicodedata.normalize('NFD', palavra)
        if unicodedata.category(c) != 'Mn'
    )

palavras_unicas = [remover_acentos(p) for p in palavras_unicas]

# Ordena as palavras
palavras_unicas.sort()
# Exibe as palavras como uma lista
with open('lista_com_aspas_virgula.txt', 'w', encoding='utf-8') as f:
    f.write('[\n')
    for palavra in palavras_unicas:
        f.write(f"'{palavra}',\n")
    f.write(']\n')

# Remove palavras que começam com 'a' ou 'A'
# Salva em um novo arquivo
with open('lista_filtrada.txt', 'w', encoding='utf-8') as file:
    for palavra in palavras_unicas:
        file.write(palavra + '\n')