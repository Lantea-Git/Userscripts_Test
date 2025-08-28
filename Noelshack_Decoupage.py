import cv2
import os
import shutil
import random
import time
import string
from math import ceil

#DEMANDE LA LIBRARIE opencv-python
#DEMANDE LA LIBRARIE requests

#Les points les plus important sont ecrit avec [X] c'est l'algo de decoupe et les previsions de bug.


# [1] Dimensions logiques (utilisées pour le calcul de la dimension idéal)
logical_block_width = 136
logical_block_height = 102
# [1] Dimensions physiques (réelles) utilisées pour la découpe (FOIS X2)
block_width = logical_block_width * 2
block_height = logical_block_height * 2


# Charger l'image
# Cherche la première image compatible dans le dossier courant
for file in os.listdir("."):
    if file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
        image_path = file
        break
else:
    print("❌ Aucune image '.jpg', '.jpeg', '.png', '.gif', 'webp' dans le dossier.")
    input()
    exit()
image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
if image.shape[2] == 3:
    image = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)


# [2] DIMENSION IDEALES basé sur Dimensions logiques (comme en JS)
default_cols = max(1, min(8, ceil(image.shape[1] / logical_block_width)))
default_rows = max(1, min(10, ceil(image.shape[0] / logical_block_height)))


# CHOIX LARGEUR
cols_input = input(f"🧮 Nombre de colonnes (max 8) [défaut {default_cols}] : ")
cols = int(cols_input) if cols_input.strip().isdigit() else default_cols
cols = min(cols, 8)
# CHOIX HAUTEUR
rows_input = input(f"🧮 Nombre de lignes (max 10) [défaut {default_rows}] : ")
rows = int(rows_input) if rows_input.strip().isdigit() else default_rows
rows = min(rows, 10)

# Dossier racine où sont extrait les images
output_root = "blocs"
# Supprimer le dossier 'blocs' s'il existe
if os.path.exists(output_root):
    shutil.rmtree(output_root)

# [3] Taille totale (ON REDIMENSIONNE LIMAGE !!AVANT!! LA DECOUPE) 
# [3] TRES IMPORTANT (logique NocturneX) basé sur taille ideal => voir [1]
total_width = block_width * cols
total_height = block_height * rows



if image is None:
    print("❌ Image introuvable.")
    exit()

# Redimensionner avec le calcul en [3]
resized = cv2.resize(image, (total_width, total_height))

# Dossier racine (lieux export)
output_root = "blocs"
os.makedirs(output_root, exist_ok=True)

# [4] Identifiant randomisé sans espace ni tiret (important pour les filtres anti mosaiques)
# [4] Doit uniquement contenir que chiffre et lettre.
def generate_mosaic_id():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
mosaic_id = generate_mosaic_id()

# Découpage + export
index = 1
for row in range(rows):
    #row_dir => ON CREER UN REPERTOIRE PAR LIGNE => pour différencier la hauteur et largeur
    row_dir = os.path.join(output_root, f"row_{row + 1:02d}")
    os.makedirs(row_dir, exist_ok=True)
    
    for col in range(cols):
        x = col * block_width
        y = row * block_height
        block = resized[y:y + block_height, x:x + block_width]

        # [5] bruit pixel !!!!TRES IMPORTANT!!!! (Necessaire pour que noelshack accepte des images uniforme)
        # [5] bruit pixel on modifie un pixel random dans l'image de manière ultra light 
        # [5] Les cordonnées du pixel sont dans le print/console.log pour debug ("Pixel bruité")
        if block.shape[2] == 3:
            block = cv2.cvtColor(block, cv2.COLOR_BGR2BGRA)
        rand_x = random.randint(0, block.shape[1] - 1)  # colonne
        rand_y = random.randint(0, block.shape[0] - 1)  # ligne
        b, g, r, a = block[rand_y, rand_x]
        r = r + 2 if r <= 253 else r - 2
        a = a + 2 if a <= 253 else a - 2
        block[rand_y, rand_x] = [b, g, r, a]
        print(f"Pixel bruité {index:02d} : x : {rand_x}, y : {rand_y}\nExemple Coin haut gauche = 0 / 0")

        # [6] LE NOM DU FICHIER À RESPECTER POUR LES FILTRES ANTIMOSAIQUES.
        # [6]  NUM+{id_randon_commun_a_la_mosaique} => voir [4]
        filename = f"{index:02d}-{mosaic_id}.png"

        filepath = os.path.join(row_dir, filename)
        cv2.imwrite(filepath, block)
        
        index += 1


print("✅ blocs créés avec noms compatibles regex.")
input()
