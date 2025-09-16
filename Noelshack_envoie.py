import os
import requests
import time

#DEMANDE LA LIBRARIE opencv-python
#DEMANDE LA LIBRARIE requests

#Les points les plus important sont ecrit avec [X].


#[1] SYSTÈME D'UPLOAD AVEC GESTION DES ERREURS 429 => 10 TENTATIVES
#[1] On évite IMPÉRATIVEMENT LES REQUÊTES PARALLÈLES risque de blocage + Ralentissement important au final .
def upload_image(filepath, max_retries=10, retry_delay=3, success_pause=1.5):
    filename = os.path.basename(filepath)
    mime = 'image/png' if filename.lower().endswith('.png') else 'image/jpeg'

    for attempt in range(1, max_retries + 1):
        try:
            #[2] Envoie vers le domaine. "/webservice/" EST TRÈS IMPORTANT => Car il y a une entrée erronée 
            #[2] Toujours ajouter l'entête 'domain : https://www.jeuxvideo.com' Elle est indispensable mais ce n'est pas une autorisation.
            with open(filepath, 'rb') as f:
                files = [
                    ('fichier[]', (filename, f, mime)),
                    ('domain', (None, 'https://www.jeuxvideo.com'))  # ✅ C’est ce champ qui autorise l’upload
                ]
                response = requests.post('https://www.noelshack.com/webservice/envoi.json', files=files)


            if response.status_code == 200:
                try:
                    data = response.json()
                    # [3] ON RECUPERE SEULEMENT URL (image direct) DE LA REPONSE
                    url = data["url"]
                    print(f"✅ {filename} envoyé")
                    time.sleep(success_pause)
                    return url
                except Exception:
                    print(f"⚠️ {filename} → réponse non JSON ou vide")
            elif response.status_code == 429:
                print(f"🚨 {filename} → Erreur 429 (TROP DE REQUÊTES) — tentative {attempt}/{max_retries}")
            else:
                print(f"⚠️ {filename} → HTTP {response.status_code} — tentative {attempt}/{max_retries}")

        except Exception as e:
            print(f"⛔ {filename} → Erreur réseau : {e}")

        # Attendre avant de réessayer
        if attempt < max_retries:
            time.sleep(retry_delay)
        else:
            print(f"💥 {filename} → ÉCHEC APRÈS {max_retries} TENTATIVES")
            return None

def main():
    base_dir = './blocs'
    result_lines = []

    row_folders = sorted([
        f for f in os.listdir(base_dir)
        if os.path.isdir(os.path.join(base_dir, f)) and f.startswith("row_")
    ])

    for row_folder in row_folders:
        row_path = os.path.join(base_dir, row_folder)
        images = sorted([
            f for f in os.listdir(row_path)
            if f.lower().endswith(('.png', '.jpg', '.jpeg'))
        ])

        row_urls = []

        for img in images:
            img_path = os.path.join(row_path, img)
            url = None
            while url is None:
                url = upload_image(img_path)
            print(url, end=' ')  # Affichage immédiat
            row_urls.append(url)

        print()  # PRINT FORCE LE RETOUR à la ligne à chaque LIGNE
        result_lines.append(' '.join(row_urls))  # on ecrit la nouvelle ligne

    # 🎯 Affichage final bien propre à copier
    print("\n🟩 URLs FINALES (juste copier coller) :\n")
    print('\n'.join(result_lines))
    input()

if __name__ == "__main__":
    main()
