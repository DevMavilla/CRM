from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import csv

# Configuração da mensagem que será enviada
mensagem = """Olá, aqui é Diego da UniFaveni! 🌟
Nossa turma de Direito 2025.2 está quase completa.
Gostaria de te passar as últimas informações.
Me responde aqui! 👨‍⚖️⚖️"""

# Caminho do chromedriver - ajuste conforme seu ambiente
driver_path = "C:/CAMINHO/DO/CHROMEDRIVER.exe"  # Alterar para o caminho correto no seu PC

# Inicializa o navegador Chrome
driver = webdriver.Chrome(executable_path=driver_path)

driver.get('https://web.whatsapp.com')
input('Escaneie o QR Code do WhatsApp Web e pressione ENTER para continuar...')

with open('contatos.csv', newline='', encoding='utf-8') as file:
    reader = csv.reader(file)
    for row in reader:
        numero = row[0]
        link = f"https://wa.me/{numero}"
        driver.get(link)
        time.sleep(7)  # tempo para carregar a página
        try:
            # Clique no botão "Mensagem" se existir
            botao = driver.find_element(By.XPATH, '//*[@id="action-button"]')
            botao.click()
            time.sleep(3)
            usar_web = driver.find_element(By.LINK_TEXT, 'use WhatsApp Web')
            usar_web.click()
            time.sleep(5)

            # Localizar a caixa de texto para digitar a mensagem
            caixa_texto = driver.find_element(By.XPATH, '//div[@contenteditable="true"][@data-tab="10"]')
            caixa_texto.send_keys(mensagem)
            caixa_texto.send_keys(Keys.ENTER)
            print(f'Mensagem enviada para {numero}')
            time.sleep(5)
        except Exception as e:
            print(f'Erro ao enviar para {numero}: {e}')
            continue

driver.quit()
