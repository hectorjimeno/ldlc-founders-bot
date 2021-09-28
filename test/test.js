const {By,Key,Builder} = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome")
require("geckodriver");
require("chromedriver");
const $ = require('jquery');

async function example(){
 
    /*
    #################################################
    INICIO BLOQUE DE CUMPLIMENTACIÓN DE DATOS
    #################################################

    /*Ruta de perfil de Chrome. Esto es importante para que la versión de Chrome que abre selenium guarde la sesión
      De esta forma solo hay que iniciar sesión en Telegram Web la primera vez que se levanta dicho chrome*/


      //Generalmente la ruta es C:/Users/xXx/AppData/Local/Google/Chrome/User Data/Default
      let profile = "";

      /*##################################################################################
        #####################################CUIDADO######################################
        Este bot actualmente considera que no estás logado en LDLC. Lo que significa que si
        haces simulacros de compra, antes de cerrar el navegador deberías CERRAR SESIÓN en LDLC.
        De lo contrario, fallará en posteriores usos al no poder iniciar sesión (ya que ya estás
        logueado)
        ##################################################################################*/


    //Credenciales de inicio de sesión en LDLC
    let LDLCmail = "";
    let LDLCpassword = "";


    //Datos de la tarjeta de pago
    
    //Todo el número junto, sin espacios. Ej: 5199830052000112
    let numeroTarjeta = "";

    //Formato: MM/yy. Ejemplo: 08/23
    let fechaExpiracionTarjeta = "";

    //Nombre en la tarjeta. Ej: AMBROSIO JIMÉNEZ MUÑOZ
    let nombreTarjeta = "";

    //CVV -> Número de seguridad de tres dígitos que se suele encontrar en la parte de detrás de la tarjeta
    let cvv = "";


    /*
    ################################################
    FIN BLOQUE CUMPLIMENTACIÓN DE DATOS
    ################################################
    */


    let messageNum = 0;
    let lastMessageElement


       let options = new chrome.Options();
       options.addArguments("--user-data-dir="+profile);
       
       //Creamos un webdriver para chrome con las opciones que hemos establecido arriba 
       let driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
 
       //Abrimos el navegador en el Telegram de PartAlert. Si al abrirlo no está en PartAlert, seleccionarlo a mano, no pasa nada.
       driver.get('https://web.telegram.org/z/#-1218633492')

       driver.sleep("1000");

       //Variable para hacer un bucle
       let x = true;

       //Recogemos el WebElement del último mensaje
       let messageElement;
       await driver.findElements(By.className("message-list-item")).then(
           (ok) => {
            messageElement = ok.pop()
           }
       )

       //Extraemos el atributo "id" del elemento
        await messageElement.getAttribute("id").then(
            (ok) => {
                messageNum = parseInt(ok.split("message")[1]);
            }
        )

        //Bucle de rastreo.
        while(x){
            console.log("buscando......");
            
            //Otro bucle. Realiza la búsqueda cada 5 segundos del elemento con el ID que queremos (el siguiente al último encontrado)
            let y = false;
            while(!y){
                console.log("Buscando mensaje " + messageNum);

                await driver.findElement(By.id("message"+messageNum.toString())).then(
                    //Si lo hemos encontrado, sale del bucle y almacena el WebElement en variable
                    (ok) => {
                        console.log("Hecho");
                        y = true;
                        lastMessageElement = ok;
                    },
                    (error) => {
                        console.log("Error");
                    }
                )
                //Si no encuentra nada, recarga en 5 segundos
                if(!y) await driver.sleep(5000);
            }

            console.log("Está visible");

            //Con el código siguiente recogemos la parte que nos interesa del elemento.
            let texto;
            await lastMessageElement.findElement(By.className('text-content with-meta')).then(
                (ok) => {
                    texto = ok;
                },
                (error) => {
                    console.log("Error");
                }
            )
            let html;
            await texto.getAttribute('innerHTML').then(
                (ok) => {
                    html = ok;
                },
                (error) => {
                    console.log("Error");
                }
            )

            //IMPORTANTE. ESTA ES LA LÍNEA QUE DEFINE QUÉ GRÁFICA QUEREMOS COMPRAR. EN ESTE CASO ESTÁ RASTREANDO TANTO 3060 TI COMO 3070, PERO NO 3070 TI.
            //La nomenclatura para las distintas tarjetas es:
            //3060 Ti
            //3070
            //3070 Ti
            //3080
            //3080 Ti
            //3090
            //(case sensitive)
            //Si queréis una 3070 o 3080 pero no una 3070 Ti ni una 3080 Ti hay que especificarle que encuentre una pero no la otra, como se ve justo debajo de este texto
            if((html.includes("Nvidia Spain") && html.includes("3060 Ti")) || (html.includes("Nvidia Spain") && ((html.includes("3070") && !html.includes("3070 Ti"))))){
                let url;
                await texto.findElement(By.className("text-entity-link")).getAttribute('innerHTML').then(
                    (ok) => {
                        url = ok;
                    },
                    (error) => {
                        console.log("Error");
                    }
                )
                
                //Encontrado lo que nos interesa, redirigimos el webdriver a la URL de compra que se especifica en el mensaje de Telegram
                driver.get(url);

                //Esperamos un par de segundos para que carguen los elementos de la página -> Estos sleep están bastante ajustados pero no me han dado problemas en estos valores
                await driver.sleep(2000);

                //Aceptamos el consentimiento de cookies, si está -> Importante, porque puede quedar por encima de elementos de la web que queremos clickar y dejarlos "obscured"
                await driver.findElement(By.id("cookieConsentAcceptButton")).then(
                    (ok) => {
                        ok.click();
                    },
                    (error) => {
                        console.log("El botón no está");
                    }
                )
                

                //Hacemos click en el botón "Comprar ya"
                await driver.findElement(By.className("add-to-cart-oneclic")).click();


                await driver.sleep(3000);

                //inicio de sesión
                await driver.findElement(By.id("Email")).sendKeys(LDLCmail);
                await driver.findElement(By.id("Password")).sendKeys(LDLCpassword);
                await driver.findElement(By.xpath("//button[contains(.,'Iniciar')]")).click();

                //Seleccionamos el tipo de envío e introducimos los detalles de la tarjeta de pago
                await driver.sleep(3000);
                await driver.findElement(By.xpath("//label[contains(.,'Entrega a domicilio')]")).click();
                await driver.sleep(1500);
                await driver.findElement(By.id("payment-form"));
                await driver.findElement(By.id("CardNumber")).sendKeys(numeroTarjeta);
                await driver.findElement(By.id("ExpirationDate")).sendKeys(fechaExpiracionTarjeta);
                await driver.findElement(By.id("OwnerName")).sendKeys(nombreTarjeta);
                await driver.findElement(By.id("Cryptogram")).sendKeys(cvv);

                //pagamos
                await driver.findElement(By.xpath("//button[contains(.,'Pagar mi pedido')]")).click();

                //Esperamos un tiempo MUY prudencial a cerrar el webdriver
                await driver.sleep(600000);
                await driver.quit();
                x= false;
            }
            else{
                //Sumamos uno al número de mensaje y a seguir buscando.
                messageNum+=1;
            }
        }   
}
 
example()
