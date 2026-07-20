-- =============================================================================
-- RETROFIT SCRIPT: add_callout_examples.sql
-- Purpose: Add example inline callouts ([[tip:...]], [[note:...]],
-- [[check:...]]) to sections that were already inserted by
-- seed_kaidoji_book.local.sql. Since that file uses
-- INSERT ... ON CONFLICT DO NOTHING, re-running it won't update existing
-- rows — these UPDATEs are what actually apply the new callout markers.
--
-- Safe to run more than once (each UPDATE just sets content to the same
-- final text). No personal/user IDs in this file, safe to commit.
--
-- If you seed a fresh database from scratch, you don't need this file —
-- the callouts are already baked into seed_kaidoji_book.local.sql itself.
-- =============================================================================

-- Sassan Kwamfuta (Babi 1) — tip
UPDATE sections
SET content = $t$Cikakkiyar kwamfuta tana da sashen sarrafa bayanai (CPU), ma'ajiya (memory), ƙananan na'urori masu shigar da bayanai ko fitar da su (input/output devices), da kuma ma'ajiyar dindindin (secondary storage device).

CPU shi ne ƙwaƙwalwar kwamfuta. Shi ne ke kula da dukkan aikace-aikacen da ke faruwa a cikin kwamfuta — yana karɓar bayanai, yana aiwatar da lissafi, sannan yana miƙa sakamakon zuwa waje ta hanyar na'urorin fitarwa. RAM (Random Access Memory) ita ce 'main memory' — wurin ajiya na ɗan lokaci wanda CPU ke dubawa domin neman umarni yayin aiwatar da furogram; idan aka kashe kwamfuta, abun da ke cikin RAM zai goge. Ma'ajiyar dindindin ita ce ma'ajiyar da ke riƙe bayanai na dogon lokaci, ko da an kashe kwamfuta sannan an sake kunna ta — misalanta sun haɗa da USB, CD/DVD, da kuma ma'ajiya a kulaud (cloud).

Na'urori masu shigar da bayanai (input devices) sun haɗa da allon rubutu (keyboard), linzamin kwamfuta (mouse), na'urar karɓar magana (microphone), da na'urar ɗaukar hoto (camera). Na'urori masu fitar da bayanai (output devices) sun haɗa da na'urar nuni (monitor), na'urar magana (speaker), da na'urar buga takarda (printer). [[tip:Shin kun san cewa lokacin da waɗannan sassan ke aiki, suna yin zafi, kuma idan babu fanka don sanyaya su, kwamfutar za ta daina aiki?]]$t$
WHERE id = '60000000-0000-0000-0000-000000000003';

-- Ƙirƙirar Manhaja (Babi 1) — check
UPDATE sections
SET content = $t$Kwamfuta tana fahimtar yaren bainari ne kawai, wato 0 da 1 (misali: 01100001). Rubuta furogram da yaren bainari yana da matuƙar wahala, saboda haka aka ƙirƙiro yaren asambli, wanda ya ɗan fi kama da yaren ɗan-Adam. Abin da ke juya asambli zuwa bainari ana kiransa asambila. Bayan haka, aka ƙirƙiro sababbin yarurruka masu kusanci da yaren ɗan-Adam da ake kira hai-lebel yarurruka (misali Java ko Python); yarurrukan da suke ƙasa da waɗannan, irinsu asambli, ana kiran su lo-lebel yarurruka.

Kwamfuta ba ta gane hai-lebel yarurruka sai an fassara su — abin da ke fassara su ake kira komfaila ko intafritar. Komfaila yana ɗaukar dukkan rubutun hai-lebel gaba ɗaya ya juya shi zuwa 'machine code' kafin a aiwatar da shi, yayin da intafritar ke fassara layi ɗaya-bayan-ɗaya, ba tare da adana sakamakon fassarar baya ba.

A cikin wannan littafi, ana amfani da sudokod — tsarin rubutu da ke ba da damar zayyana ƙa'idoji da dabarun rubuta furogram ba tare da damuwa da sintaks (ƙa'idojin yare) ba. [[check:Kafin ka ci gaba, gwada ka bayyana bambanci tsakanin komfaila da intafritar da kalmominka.]]$t$
WHERE id = '60000000-0000-0000-0000-000000000004';

-- Nau'in Bayanai (Babi 2) — note
UPDATE sections
SET content = $t$A mafi yawan hai-lebel yarurruka, ana buƙatar a fara saka sunan nau'in bayani sannan sunan bariyabel kafin a yi amfani da shi, misali: Lamba cikakkiya Farashi. Idan aka saka wani nau'in bayanai daban da aka ayyana, komfaila za ta nuna kuskure kuma furogram ɗin zai ƙi aiki. [[note:Akwai yarurukan da ba sa buƙatar fadar nau'in bayanai. Kwamfutar na tantancewa daga irin bayanan da aka bayar. Misali, PYTHON.]]

Ana ba wa bariyabel suna ta amfani da kamel-kes (camelCase) — inda kalma ta farko take farawa da ƙaramin harafi, sai kowace kalma da ta biyo baya ta fara da babban harafi, misali: yawanƊalibai. Akwai kuma ƙimantawa (initialization), wato ba wa bariyabel ƙimarsa ta farko tun kafin a yi amfani da shi, domin idan ba a ƙimanta bariyabel ba, zai riƙe shara — wato duk wani abu da ya ga dama.$t$
WHERE id = '60000000-0000-0000-0000-000000000009';

-- Are (Array) (Babi 3) — note
UPDATE sections
SET content = $t$Are wani tsarin tanada gurbin ma'ajiya ne wanda ake amfani da shi don adana bayanai fiye da guda ɗaya waje ɗaya, amma kowanne bayani yana da nasa matsayi a ciki. Kamar bariyabel, sai an ba wa are suna kuma a faɗi wane irin bayanai zai riƙe, amma bugu da ƙari sai an bayyana abubuwa nawa zai riƙe, ta amfani da alamar "[ ]", misali: Lamba cikakkiya Ajujuwa[50]. [[note:A lura cewa lamban da ke cikin "[ ]" dole ne ta kasance lamba cikakkiya, domin kwamfuta ba ta iya ba da rabin wuri.]] Dole ne nau'in bayanin da ke cikin are ya kasance iri ɗaya. Kowane gida a cikin are yana da adireshinsa — lambar da ke nuna a wane gurbi bayanin yake.$t$
WHERE id = '60000000-0000-0000-0000-000000000015';

-- Buliyen (Boolean) (Babi 4) — note
UPDATE sections
SET content = $t$Sharaɗi dole ne ya kasance buliyen — wato ya haifar da sakamakon gaskiya ko ƙarya kawai. Ana amfani da alamomin kwatanta dangantaka wajen rubuta buliyen: < (fi ƙanƙanta), > (fi girma), >= (fi girma ko su zo ɗaya), <= (fi ƙanƙanta ko su zo ɗaya), == (daidai da), da != (ba daidai yake ba). [[note:A sani cewa == ana amfani da shi wajen bincika daidaito, amma = ana amfani da shi wajen ba wa bariyabel ƙima.]]

Idan ana so a haɗa buliyen fiye da ɗaya, ana amfani da kalmomin haɗa dabaru: Da (yana bada gaskiya idan duka biyun gaskiya ne), Ko (yana bada gaskiya idan aƙalla ɗaya gaskiya ne), da A'a (yana juya ƙimar buliyen — ana amfani da alamar "!").$t$
WHERE id = '60000000-0000-0000-0000-000000000021';

-- Fasahar Zamani (Babi 1) — check
UPDATE sections
SET content = $t$Na'ura mai ƙwaƙwalwa, wato kwamfuta, wata irin na'ura ce da ke iya sarrafa umarni domin aiwatar da wasu ayyuka na musamman. Misalan irin waɗannan na'urorin sun haɗa da: kwamfutar tafi-da-gidanka (laptop), kwamfutar tebur (desktop), na'urar lissafi (calculator), na'urar ɗumama ko gasa abinci (microwave), da na'urar jagora don nuna wuri (navigation device). Gaba ɗaya waɗannan na'urori suna da sassan na zahiri da suka haɗu suka ƙirƙire su. Sashen zahiri (hardware) shi ne sashen da ake iya gani ko taɓawa. [[check:Ba da na ku misalin wata na'ura mai ƙwaƙwalwa da kake amfani da ita a kullum.]]$t$
WHERE id = '60000000-0000-0000-0000-000000000002';

-- Amfani Da Are (Babi 3) — note
UPDATE sections
SET content = $t$Ana iya shigar da data a cikin are ta hanyar saka lambar gidan da ake so a cikin "[ ]", misali: abince[2] = 'kankana'. Ana kuma iya samun ko canza abin da ke cikin wani gida ta amfani da wannan lambar adireshi. Are yana da matuƙar amfani wajen aiki tare da tsarin maimaici, domin ana iya zagayawa cikin dukkan gidajen are ɗaya bayan ɗaya ba tare da rubuta layin umarni sau da yawa ba. [[note:Duk lokacin da ake neman mai amfani da manhajar ya rubuta wani abu, kwamfuta za ta tsaya har sai an shigar da saƙo.]]$t$
WHERE id = '60000000-0000-0000-0000-000000000016';

-- Tsarin Maimaici (Babi 5) — tip + note
UPDATE sections
SET content = $t$Tsarin maimaici wani tsari ne da ake amfani da shi domin a maimaita wani ɓangare na furogram, don kauce wa rubuta layuka da yawa ko idan ba a san adadin rubutun da za a buƙata ba. Akwai nau'ikan tsarin maimaitawa guda biyu: maimaici bisa ƙidaya, wanda ke maimaitawa bisa canjin ƙidaya har sai an kai iyakar da aka ƙayyade (yana da sassa huɗu: ƙimantawa, sharaɗi, ƙara ko rage ƙidaya, da umarni na ciki); da maimaici bisa sharaɗi, wanda ke maimaitawa muddin wani sharaɗi gaskiya ne, ba tare da dogaro da wata lamba ba. [[tip:Shin kun san cewa a yaren kwamfuta 1 yana nufin gaskiya kuma 0 yana nufin ƙarya?]] [[note:Za a iya amfani da -- don rage ƙidaya da ɗaya. Kuma idan an so, za a iya yin fiye da ɗaya a lokaci, kamar ++5 ko --3.]] A cikin duka nau'ikan biyu, dole ne a tanadi hanyar tsayawa domin kauce wa madauwari mara iyaka.$t$
WHERE id = '60000000-0000-0000-0000-000000000026';

-- Tsarin Aiki (Babi 6) — note
UPDATE sections
SET content = $t$Aiki yana da sassan daban-daban: sunan aiki (wanda ake kira aikin da shi), shigarwa ko faramita (bayanan da aikin ke karɓa), jikin aikin (umarnin da aikin zai aiwatar), da sakamako (abin da aikin ke mayarwa bayan ya kammala). Idan an ayyana aiki, kwamfuta tana karanta umarnin amma ba ta aiwatar da su sai an kira aikin.

Akwai bambanci tsakanin lokal bariyabel — wanda aka ƙirƙira a cikin wani aiki kuma ana iya amfani da shi kawai a cikin wannan aikin, kuma kwamfuta na goge shi bayan an kammala aikin — da gulobal bariyabel, wanda ake ƙirƙira a wajen duk wani aiki, don haka ana iya amfani da shi a kowane sashe na furogram ɗin. [[note:Akwai yarrurukan da ba sa buƙatar faɗar nau'in sakamakon. Kwamfuta na tantancewa, misali: Python.]]$t$
WHERE id = '60000000-0000-0000-0000-000000000031';

-- Ma'ajiyan Ayyuka (Babi 6) — tip
UPDATE sections
SET content = $t$Akwai wasu ayyuka da furograma ba sai ya rubuta su da kansa ba kafin ya yi amfani da su — waɗannan ana adana su ne a ɗakin ajiya na aiki (function library), kuma an riga an ƙirƙire su domin sauƙaƙa rubuta furogram. Misali, SQRT() wani aiki ne daga ɗakin ajiya na ayyuka wanda ke yin lissafin tushen murabba'i, kuma ba mu rubuta yadda yake yin lissafinsa ba amma mun san cewa yana yi idan aka kira shi. [[tip:Kun san cewa ayyukan da suke cikin ɗakin ajiya na ayyuka suna ɗaya daga cikin dalilan da yasa ake iya rubuta furogram da sauri? Masu rubuta furogram suna yawan amfani da ayyukan da wasu suka riga suka rubuta.]]$t$
WHERE id = '60000000-0000-0000-0000-000000000033';
