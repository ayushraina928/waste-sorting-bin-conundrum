#Imports Packages
import os
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time 
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

use_case = ['Liner bags (cereal, cookies, crackers)'
,'Black plastic food containers, cutlery and lids'
,'straw'
,'disposable sheets'
,'baby wipes'
,'make-up pads'
,'cotton swabs'
,'aluminum foil'
,'Drink pouches#https://www.google.com/search?q=Drink+pouch&tbm=isch&hl=en&chips=q:drink+pouch,g_1:blank:ZcD8QCZYx-8%3D&sa=X&ved=2ahUKEwjj6O2Ko7D2AhUQFjQIHR9rBugQ4lYoBXoECAEQKA&biw=1519&bih=746'
,'toothpick' 
,'wood chips'
,'pencil shavings'
,'gross hair in drain'
,'clump of hair in hand'
,'nail clippings#https://www.google.com/search?q=nail+clippings&tbm=isch&chips=q:nail+clippings,g_1:pile:iZvsinCmkxA%3D&hl=en&sa=X&ved=2ahUKEwjtjfm1zLD2AhU4HDQIHZ1yCBIQ4lYoA3oECAEQJA&biw=1519&bih=746'
,'ashes'
,'Gum packages and blister packs'
,'Metallic gift wrap and bows+machine learning'
,'Ribbons'
,'Wooden fruit crates'
,'Broken mugs and dishes'
,'Aluminum foil wrap'
,'House Dust#https://www.google.com/search?q=house%20dust%20images&tbm=isch&hl=en&tbs=rimg:Cf5nq9pF3qqDYZiWKYJyqyyxsgIMCgIIABAAOgQIABAB&sa=X&ved=0CBsQuIIBahcKEwiIn8mX0bD2AhUAAAAAHQAAAAAQBw&biw=1519&bih=746'
,'Pieces of wood']

for garbage in use_case:
    
    if garbage.find('#') == -1:
    
        driver = webdriver.Chrome('chromedriver.exe')

        try:
            
            driver.get('https://www.google.ca/imghp?hl=en&tab=ri&authuser=0&ogbl')
            search1 = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.NAME, "q"))
            )
            search1.clear()
            search1.send_keys(garbage)
            search1.send_keys(Keys.RETURN)
        except:
            print("Failed at" + str(garbage))
            break
        
    else:
        
        driver = webdriver.Chrome('chromedriver.exe')

        try:
            driver.get(garbage[(garbage.find("#") + 1):])
        except:
            print("Failed at" + str(garbage))
            break
    
    
    wait_counter = 0
    for y in range(1,20):
        driver.execute_script("window.scrollTo(0, "+str(y*1000)+")")
        
        wait_counter = wait_counter + 1
        
        if wait_counter == 5:
            time.sleep(1)
            wait_counter = 0
            
    driver.execute_script("window.scrollTo(0,0)")
    time.sleep(5)
    lnks=driver.find_elements_by_tag_name("img")
    img = []
    for lnk in lnks:
    
       if str(lnk.get_attribute('src')).find('data:image') != -1 or str(lnk.get_attribute('src')).find('https://encrypted-tbn0.gstatic.com') != -1:
            img.append(lnk.get_attribute('src'))
            
    print("The length is " + str(len(img)))
    driver.quit()
    counter = 1

    if garbage.find('#') == -1:
        path = garbage
    else:
        path = garbage[0:(garbage.find('#'))]
    
    
    isExist = os.path.exists(path)

    if not isExist:
        # Create a new directory because it does not exist 
        os.makedirs(path)
        print("The new directory is created!")
    
    
    for img_link in img: 
        
        try:
            driver = webdriver.Chrome('chromedriver.exe')
            driver.get(img_link)

        # Check whether the specified path exists or not
        except:
            print("driver failed at image")
            break
        
        driver.save_screenshot(str(path) + "/"+str(path)+"_"+str(counter) +".png")
        counter = counter + 1
        driver.close()