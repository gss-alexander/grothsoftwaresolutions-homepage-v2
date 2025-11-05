Den 1. oktober 2025 trådte digitalsikkerhetsloven i kraft. Ingen overgangsperiode, ingen utsettelser. Bedrifter som leverer samfunnsviktige tjenester eller digitale tjenester må nå oppfylle omfattende sikkerhetskrav, med bøter på opptil 4% av omsetningen ved brudd.

Loven påvirker flere tusen norske bedrifter. Om du leverer energi, vann, transport, helsehjelp, banktjenester eller driver digitale plattformer, er sannsynligheten stor for at du er omfattet. Men selv om bedriften din ikke er direkte omfattet, kan kunder kreve at du oppfyller tilsvarende krav.

Denne artikkelen fokuserer på de tekniske kravene i loven. Hva må implementeres? Hvordan kan det gjøres uten å bruke millioner? Og hvilke valg kan spare deg for både tid og penger?

## Hvem omfattes av loven?

Digitalsikkerhetsloven gjelder to typer virksomheter:

**Tilbydere av samfunnsviktige tjenester** dekker syv sektorer:
- Energi (kraftproduksjon, nett, lagring)
- Transport (luftfart, tog, skip, veier)
- Helsevesen (helseforetak, store kommuner)
- Vannforsyning (over 2000 m³/dag)
- Bank og finans (systemviktige banker)
- Finansmarkedsinfrastruktur (Oslo Børs, betalingssystemer)
- Digital infrastruktur (.no-domenet, DNS, internettutveksling)

**Tilbydere av digitale tjenester** omfatter:
- Nettbaserte markedsplasser
- Nettsøkemotorer  
- Skytjenester

Men bare hvis de har **50 ansatte eller mer** og **over €10 millioner (~NOK 115 millioner) i årlig omsetning**. Små digitale tjenester er fritatt.

Selv om du er fritatt, kan kundene dine kreve tilsvarende sikkerhet. En liten IT-bedrift som leverer til sykehus eller kraftverk må dokumentere sikkerhet uansett. Loven skaper indirekte krav nedover i leverandørkjeden.

## De ni obligatoriske tekniske tiltakene

Lovens §10 definerer ni teknologiske sikkerhetstiltak som **må** implementeres. Ikke "bør", ikke "anbefales", men må. Uten dokumentert grunn og godkjenning fra daglig leder kan du ikke hoppe over dem.

### 1. Multifaktorautentisering (MFA)

Alle som får tilgang til systemer må autentisere seg med mer enn bare passord. Dette er det enkeste og mest effektive sikkerhetstiltaket som finnes.

**Hva det betyr i praksis:**
- SMS-koder, autentiseringsapper (Microsoft Authenticator, Google Authenticator), fysiske nøkler (YubiKey)
- Påkrevd for alle brukere, ikke bare administratorer
- Gjelder både interne systemer og eksterne tjenester

**Implementering:**
- Skru på MFA i Microsoft 365 eller Google Workspace (ofte allerede inkludert i lisenser)
- Krev MFA for VPN-tilgang
- Implementer på alle administrative grensesnitt
- Dokumenter unntak hvis noen systemer ikke støtter MFA

### 2. Tilgangskontroll

Brukere skal bare ha tilgang til det de trenger for å gjøre jobben sin. Ikke mer, ikke mindre.

**Hva det betyr i praksis:**
- Rollebasert tilgang (RBAC)
- Minste privilegium-prinsippet
- Regelmessig gjennomgang av tilganger
- Umiddelbar tilbakekalling ved avsluttet arbeidsforhold

**Implementering:**
- Kartlegg hvilke roller som finnes i organisasjonen
- Definer tilganger per rolle
- Bruk grupper i Active Directory / Azure AD
- Automatiser tilgangstildeling ved onboarding
- Sett opp årlig tilgangsgjennomgang

### 3. Nettverkssegmentering

Systemene dine skal deles opp slik at et kompromittert system ikke gir angripere tilgang til alt.

**Hva det betyr i praksis:**
- Separate nettverk for ulike formål (kontor, produksjon, gjestenett)
- VLAN-segmentering
- Brannmurer mellom segmenter
- Ingen flat nettverksarkitektur hvor alt kan snakke med alt

**Implementering:**
- Start med tre segmenter: Produksjon, administrasjon, gjester
- Definer trafikkregler mellom segmenter
- Blokkér alt som standard, åpne bare det som trengs
- Separer IT-systemer fra OT-systemer (SCADA, ICS)

### 4. Tilgjengelighet og kapasitet

Systemer må være tilgjengelige når de trengs, og tåle forventet belastning.

**Hva det betyr i praksis:**
- Redundans i kritiske komponenter
- UPS (strømbackup)
- Lastbalansering
- DDoS-beskyttelse
- Kapasitetsplanlegging

**Implementering:**
- Identifiser enkeltstående feilpunkter (single points of failure)
- Implementer redundans for kritiske tjenester
- Test failover-mekanismer kvartalsvis
- Kjør belastningstester årlig
- Bruk cloud for elastisk kapasitet

### 5. Oppdatering og patching

Systemer må holdes oppdatert med sikkerhetsoppdateringer.

**Hva det betyr i praksis:**
- Automatisk oppdatering hvor mulig
- Definert prosess for manuelle oppdateringer
- Testing før produksjonsutrulling
- Sårbarhetsskanning for å finne manglende oppdateringer

**Implementering:**
- Skru på automatisk oppdatering for arbeidstasjoner
- Definer patch-vindu for servere (f.eks. andre tirsdag hver måned)
- Test kritiske oppdateringer i testmiljø først
- Dokumenter hvilke systemer som ikke kan oppdateres (legacy)
- Kompenserende kontroller for systemer som ikke kan patche

### 6. Sikkerhetsovervåking

Du må kunne oppdage sikkerhetshendelser når de skjer.

**Hva det betyr i praksis:**
- Logging av sikkerhetshendelser
- Sentralisert loggsamling
- Varsling ved mistenkelig aktivitet
- SIEM (Security Information and Event Management)

**Implementering:**
- Start med å aktivere logging på alle systemer
- Samle logger sentralt (ikke spredt på hver server)
- Definer varsler for kritiske hendelser (admin-pålogging utenom arbeidstid, flere mislykkede innlogginger)
- Sett opp automatisk kobling til hendelseshåndtering
- Gjennomgå logger ukentlig (minimum)

### 7. Sikkerhetskopier og gjenoppretting

Data må sikkerhetskopires regelmessig og gjenoppretting må testes.

**Hva det betyr i praksis:**
- Automatiske daglige backups
- Oppbevaring offsite (ikke bare på samme lokasjon)
- Krypterte backups
- Testet gjenoppretting kvartalsvis
- 3-2-1-regelen: 3 kopier, 2 medier, 1 offsite

**Implementering:**
- Automatiser alle backups
- Test gjenoppretting minst fire ganger per år
- Dokumenter gjenopprettingstid (RTO) og datatapotensialet (RPO)
- Sikre at backup-systemet ikke er tilgjengelig fra produksjonsnettverket (ransomware-beskyttelse)
- Hold én backup offline

### 8. Kryptering

Data må krypteres både i hvile (på disk) og i transitt (over nettverk).

**Hva det betyr i praksis:**
- HTTPS/TLS for all webtrafikk
- VPN for ekstern tilgang
- Krypterte disker på servere og arbeidstasjoner
- Kryptert e-post for sensitiv informasjon
- Sikker lagring av kryptonøkler

**Implementering:**
- Skru på BitLocker/FileVault på alle arbeidstasjoner
- Krypter alle serverdisker
- Bruk HTTPS overalt (HTTP skal ikke finnes)
- Implementer VPN for alle eksterne tilkoblinger
- Administrer kryptonøkler sentralt

### 9. Sikkerhet i leverandørkjeden

Du er ansvarlig for sikkerhet hos leverandører som behandler dine data.

**Hva det betyr i praksis:**
- Sikkerhetsvurdering av leverandører
- Kontraktskrav om sikkerhet
- Regelmessig revisjon av leverandører
- Dokumentasjon av leverandørrisiko

**Implementering:**
- Kartlegg alle leverandører som behandler data
- Klassifiser leverandører etter risiko
- Krev sikkerhetsdokumentasjon (ISO 27001, SOC 2)
- Inkluder sikkerhetskrav i kontrakter
- Gjennomgå kritiske leverandører årlig

## Organisatoriske krav som påvirker tekniske valg

Loven krever også dokumentert styringssystem (§9) med sikkerhetspolicy, risikohåndteringsplan og hendelseshåndteringsplan. Daglig leder må godkjenne dette årlig. Ansvaret kan ikke delegeres.

Ved sikkerhetshendelser må du rapportere til NSM innen 24 timer (førstemelding), 72 timer (oppdatering) og 1 måned (sluttrapport). Dette krever teknisk logging og sporingsevne, ofte integrert i SIEM-løsningen.

## Praktiske utfordringer ved implementering

**Legacy-systemer**

Mange bedrifter har eldre systemer som ikke støtter moderne sikkerhetskontroller. Et SCADA-system fra 2010 kan ikke kjøre MFA. Et industrielt styringssystem kan ikke oppdateres uten produksjonsstopp.

Løsningen er kompenserende kontroller: Nettverkssegmentering som isolerer legacy-systemer, ekstra overvåking, fysisk tilgangskontroll. Dokumenter hvorfor primærkontroll ikke kan implementeres og hvilke alternative tiltak som er på plass.

**Eksisterende infrastruktur**

De fleste bedrifter har allerede sikkerhetsverktøy. Microsoft 365 Business Premium inkluderer MFA, Defender, Intune og Purview. Google Workspace har tilsvarende. Cloud-plattformer som Azure, AWS og GCP har innebygd kryptering, nettverkssegmentering og logging.

Start med å aktivere sikkerhetsfeaturene du allerede betaler for før du kjøper nye verktøy. Mange bedrifter oppfyller 60-70% av kravene ved å konfigurere eksisterende lisenser riktig.

**Kompetansemangel**

Få bedrifter har dedikerte sikkerhetsressurser. Løsningen er enten å bygge kompetanse internt (tidkrevende) eller outsource deler av overvåkingen til norske MSSPs som tilbyr døgnkontinuerlig overvåking og hendelseshåndtering.

## Tekniske feil å unngå

**Kjøpe verktøy før kartlegging**

Gap-analysen først, verktøy etterpå. Ellers ender du med overlappende systemer som ikke integrerer.

**Ignorere testing**

Backup, hendelsesplan, failover. Alle må testes regelmessig. En utestet backup er som ingen backup.

**Overkomplisere arkitekturen**

Start enkelt. Tre nettverkssegmenter er bedre enn ti du ikke forstår. Ti siders policy er bedre enn femti ingen leser.

**Glemme dokumentasjon**

Hvis det ikke er dokumentert, eksisterer det ikke for revisor. Dokumenter alt: arkitektur, prosesser, unntak, tester.

## Start hvor du er

Digitalsikkerhetsloven krever systematisk sikkerhet, ikke perfekt sikkerhet. De ni tekniske tiltakene er implementerbare for de fleste bedrifter, spesielt hvis du:

- Bruker gratis NSM-ressurser (Cybersjekk-verktøyet, Grunnprinsipper, maler)
- Aktiverer sikkerhetsfunksjoner i eksisterende lisenser
- Implementerer i prioritert rekkefølge (MFA, logging, backup først)
- Dokumenterer kompenserende kontroller for legacy-systemer

Første steg er å forstå hva du allerede har. Mange bedrifter oppfyller mer enn de tror når de kartlegger eksisterende infrastruktur.

---

Jeg hjelper norske bedrifter med teknisk implementering av digitalsikkerhetsloven. Hvis du trenger å forstå tekniske krav og faktisk bygge løsninger i stedet for bare skrive rapporter, ta kontakt for en samtale.

Selv om vi ikke ender opp med å jobbe sammen, kan jeg hjelpe deg å kartlegge hva som faktisk kreves og hvordan eksisterende infrastruktur kan brukes smartere.