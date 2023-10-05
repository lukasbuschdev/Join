## Link zur Website: [Join/login](https://tarik-uyan.developerakademie.net/Join/login)

Dies ist das Kanban-Projekt **Join** im Rahmen der Frontend-Ausbildung der Developerakademie erstellt von **Lukas Busch** und **Tarik Uyan**.

<details>
<summary>Features</summary>
  
# Features

- **Registrierung & Verifizierung**: Bei der Registrierung eines neuen Kontos bei Join wird nach der Eingabe von Nutzername, Mailadresse und Passwort und dem Bestätigen der Datenschutzbestimmungen eine ***e-Mail zur Verifizierung*** verschickt. Um das Konto zu bestätigen, kann auf den ***Link in der e-Mail*** geklickt oder der Verifizierungscode händisch oder per Copy & Paste auf der Verifizierungsseite eingegeben und abgeschickt werden.
- **Konto erstellen**: Es ist möglich, ein Profilbild hochzuladen (und auch wieder zu löschen) und eine Profilfarbe auszuwählen.
- **Login**: mit optionaler Speicherung der Anmeldedaten
- **Password zurücksetzen**: Das Zurücksetzen des Passworts funktioniert wie die Verifizierung auch ***per e-Mail***.
## 
- **Automatischer Logout**: nach 5 Minuten inaktivität (document.visibilityState == "hidden")
- **Benachrichtigunen & Websocket Server**: Beim Benden einer Kontaktanfrage, Mitwirkenden-Einladung oder bei der Zuweisung einer Aufgabe and einen Mitwirkenden erhält dieser - falls er online ist - eine Live-Benachrichtigung. Dafür wurde ein ***Websocket Server*** erstellt.
- **Kontoeinstellungen**: Beim Klicken auf das eigene Profil rechts oben öffnen sich die Kontoeinstellungen. Hier lassen sich ***Benachrichtigungen einsehen***, ***Kontaktanfragen*** und ***Tafeleinladungen*** ablehnen oder akzeptieren, 
- **Sprachen**: Je nach eingestellter Standardsprache im Browser wird die Sprache geladen. Außerdem sind Spracheinstellungen beim Login und in den Kontoeinstellungen zu finden. (Verfügbare Sprachen: de, en, fr, it, es, pg, tr).
##
- **Tafel erstellen**: es gibt nicht nur eine Standard-Tafel, man muss eine ***erstellen*** oder zu einer anderen ***eingeladen werden***. Es kann ein Name bestimmt, Kategorien festgelegt und Mitwirkende eingeladen werden.
- **Tafel bearbeiten**: nach der Erstellung lässt sich (nur vom Ersteller) die Tafel bearbeiten, es können Mitwirkende per Einladung hinzugefügt (aber nicht wieder entfernt!) werden, Kategorien können hinzugefügt oder gelöscht werden.
- **Tafel löschen**: ganze Boards können auch gelöscht werden (mit Bestätigung).
- **Tafel auswählen**: um die ***aktive Tafel*** auszuwählen, muss zuerst auf "Übersicht"/"Summary" und dann ggf. auf "Tafel auswählen"/"Select Board" geklickt werden. Dann in der Auswahl auf die gewünschte Tafel klicken.
## 
- **Aufgaben erstellen**: einzelne Aufgaben (mitsamt ***Unteraufgaben***) können erstellt werden und Mitwirkende der entsprechenden Tafel können Aufgaben zugewiesen werden.
- **Aufgaben bearbeiten/löschen**: Aufgaben können bearbeitet und gelöscht werden.
- **Verschieben der Aufgaben**: Aufgaben können in der Board-Ansicht zwischen den 4 Typen ***to do***, ***in progress***, ***awaiting feedback*** und ***done*** per ***Drag & Drop*** verschoben werden.
## 
- **Kontakt- & Mitwirkendenanfrage**: Beim Hinzufügen eines Kontaktes oder dem eines Mitwirkenden wird eine ***Anfrage gesendet***, die erst vom Empfänger bestätigt werden muss, bevor dieser in den Kontakten / der Tafel gespeichert ist.
- **Kontakte hinzufügen**: Um einen neuen Kontakt hinzuzufügen, müssen in das Suchfeld ***mindestens 3 Buchstaben*** des Namens eingegeben werden, bevor Suchergebnisse angezeigt werden.
</details>

<details>
<summary>Aufgabenverteilung</summary>
  
# Aufgabenverteilung

## Lukas Busch
- Add Task
- Contacts / Add Contact
- Übersetzung & Sprache
- Privacy / Legal Notice / Help
- Das meiste vom Responsive Design 

## Tarik Uyan
- Signup / Login / Forgot_Password / Verify_Account / Create_Account
- REMOTE Storage
- Websocket Server & Notifications
- E-mails & Foto-Upload mit php
- Summary / New Board / Edit Board
- Board / Edit Task / Drag & Drop
</details>

# !BITTE LESEN!
***An die-/denjenige(n), die/der uns zu unserem Projekt Feedback gibt:***
### 1.
Da wir uns dafür entschieden haben, keinen Guest Login zu implementieren, haben wir einen Account eingerichtet, um die Seite zu testen. In diesem Account gibt es eine Tafel mit mehreren Tasks und einige Kontakte. Die Account-Daten lauten wie folgt:

* Username: ***Dev_Akademie***
* Password: ***Akademie123***

Es würde uns aber trotzdem freuen, wenn du mal den Prozess der Registrierung mitsamt e-Mail-Verifikation durchlaufen würdest :)

### 2.
Da das Hinzufügen von Kontakten und Mitwirkenden eine Bestätigung der jeweiligen Person erfordert, ist es schwierig, diese Features alleine zu testen. Deswegen wäre es ideal, wenn wir uns eine Zeit ausmachen könnten, in der wir das Feature mitsamt den Live-Benachrichtigungen vorführen können. Alternativ könntest du auch einfach einen zweiten Tab aufmachen und dich dort mit einem anderen Konto anmelden.
