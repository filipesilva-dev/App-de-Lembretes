# LembretesApp

Aplicativo de lembretes personalizados desenvolvido em **React Native + Expo + TypeScript**

O app permite criar lembretes com nome, descrição, horário e recorrência, disparar notificações locais no horário definido e interagir com essas notificações por meio dos botões **Concluir** e **Adiar 10 min**, mesmo sem abrir o aplicativo.

---

## 📋 Sumário

- [Funcionalidades](#-funcionalidades)
- [Tecnologias utilizadas](#-tecnologias-utilizadas)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e execução](#-instalação-e-execução)
- [Como o app funciona](#-como-o-app-funciona)
- [Permissões](#-permissões)
- [Solução de problemas](#-solução-de-problemas)
- [Conceitos aplicados](#-conceitos-aplicados)

---

## ✨ Funcionalidades

- ✅ **Criar lembretes personalizados** com:
  - Nome (título)
  - Descrição
  - Horário (seletor nativo de hora)
  - Recorrência (Única ou Diária)
- ✅ **Agendamento de notificação local** no horário escolhido
- ✅ **Ações interativas na notificação**:
  - **Concluir** — cancela o lembrete e o remove da lista
  - **Adiar 10 min** — reagenda a notificação para 10 minutos depois
- ✅ **Cancelamento manual** de qualquer lembrete pela tela inicial (botão **X**)
- ✅ **Persistência local** dos lembretes com `AsyncStorage`
- ✅ **Recarregamento automático** da lista ao voltar para a tela inicial
- ✅ **Navegação por Stack** com `React Navigation`

---

## 🛠 Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| **React Native** | Framework base para o app mobile |
| **Expo** | Toolchain que simplifica o desenvolvimento |
| **TypeScript** | Tipagem estática em todo o projeto |
| **React Navigation (Native Stack)** | Navegação entre telas |
| **expo-notifications** | Agendamento e ações em notificações locais |
| **@react-native-async-storage/async-storage** | Persistência local dos lembretes |
| **@react-native-community/datetimepicker** | Seletor nativo de hora |
| **uuid** | Geração de identificadores únicos para cada lembrete |
| **react-native-get-random-values** | Polyfill de `crypto.getRandomValues` para o `uuid` funcionar no Hermes |

---

## 📁 Estrutura do projeto

```
LembretesApp/
├── App.tsx                          # Raiz do app: navegação + configuração das notificações
├── app.json                         # Configuração do Expo
├── index.ts                         # Ponto de entrada
├── tsconfig.json                    # Configuração do TypeScript
├── package.json
├── android/                         # Projeto nativo gerado pelo prebuild (após expo run:android)
└── src/
    ├── navigation/
    │   └── types.ts                 # Tipagem das rotas (RootStackParamList)
    ├── screens/
    │   ├── HomeScreen.tsx           # Lista de lembretes + cancelamento + listener das ações
    │   └── CreateReminderScreen.tsx # Formulário de criação + agendamento da notificação
    ├── components/
    │   └── ReminderCard.tsx         # Card individual de cada lembrete
    ├── storage/
    │   └── reminderStorage.ts       # Funções de leitura/escrita no AsyncStorage
    └── types/
        └── index.ts                 # Tipos globais (Lembrete, Recorrencia, LembreteData)
```

## 🚀 Instalação e execução

### 1. Clonar/entrar no projeto

```bash
cd ~/notificacaoReact/LembretesApp
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar o app

Existem duas formas principais:

#### 🅰️ Modo **Expo Go** (apenas para testes rápidos de UI)

```bash
npx expo start
```

Depois escaneie o QR code com o **Expo Go** ou aperte `a` para abrir no emulador Android.

> ⚠️ **Atenção:** a partir do SDK 53, o **Expo Go no Android não suporta mais `expo-notifications`**. O app vai crashar ao tentar usar notificações. Para testar as notificações, use o modo abaixo.

#### 🅱️ Modo **Development Build** (recomendado — notificações funcionam)

```bash
npx expo run:android
```

Esse comando:
1. Gera o projeto nativo em `android/` (primeira vez)
2. Compila o APK com Gradle
3. Instala no emulador/dispositivo conectado
4. Inicia o Metro Bundler

O app abre automaticamente no emulador com todas as funcionalidades ativas.

---

## 🧠 Como o app funciona

### Fluxo geral

```
[Tela Inicial] ──▶ [+ botão flutuante] ──▶ [Tela de Criação]
      ▲                                            │
      │                                            │ (salvar)
      │                                            ▼
      │                                   [Agenda notificação]
      │                                            │
      │                                            ▼
      │                                   [Salva no AsyncStorage]
      │                                            │
      └──────────── goBack() ◀─────────────────────┘

[Notificação dispara] ──▶ usuário toca em:
                              ├── "Concluir" ──▶ remove o lembrete
                              └── "Adiar 10 min" ──▶ reagenda para +10min
```

### Etapa por etapa

#### 1. Configuração inicial (`App.tsx`)

Na inicialização do app:

- É registrado um **handler de notificação** que diz como o app deve se comportar quando uma notificação chega com o app aberto (`shouldShowAlert`, `shouldShowBanner`, etc.)
- É solicitada **permissão de notificação** ao usuário
- É criada uma **categoria de notificação** chamada `'lembrete'`, que contém os botões **Concluir** e **Adiar 10 min**

Sem essas configurações, os botões de ação não apareceriam na notificação.

#### 2. Criação de lembrete (`CreateReminderScreen.tsx`)

O usuário preenche:
- **Título** e **Descrição** (obrigatórios)
- **Horário** (via `DateTimePicker`)
- **Recorrência** (Única ou Diária)

Ao tocar em **Agendar Lembrete**:

1. Gera um `id` único com `uuid`
2. Calcula a data/hora do gatilho:
   - Se o horário já passou hoje, agenda para amanhã
3. Chama `Notifications.scheduleNotificationAsync` com:
   - `content.title` = "Lembrete: {nome}"
   - `content.body` = descrição
   - `content.data` = dados do lembrete (usados depois pelos botões de ação)
   - `content.categoryIdentifier` = `'lembrete'` (para mostrar os botões)
   - `trigger.type` = `DATE` com a data calculada
4. Salva o lembrete no **AsyncStorage**
5. Volta para a tela inicial com `navigation.goBack()`

#### 3. Listagem (`HomeScreen.tsx`)

- Ao ganhar foco (`useFocusEffect`), recarrega os lembretes do AsyncStorage
- Renderiza cada lembrete em um `ReminderCard`
- Cada card tem um botão **X** que:
  - Cancela a notificação agendada (`cancelScheduledNotificationAsync`)
  - Remove o lembrete da lista
  - Atualiza o AsyncStorage

#### 4. Ações na notificação

Quando o usuário recebe a notificação e toca em:

- **Concluir** → o listener `addNotificationResponseReceivedListener` recebe `actionIdentifier === 'concluir'` e chama `cancelarLembrete(id)`
- **Adiar 10 min** → recebe `actionIdentifier === 'adiar'`, cancela a notificação original e agenda uma nova com `trigger: { type: TIME_INTERVAL, seconds: 600 }`

Isso funciona **mesmo com o app fechado**, porque as ações são resolvidas nativamente e o listener do Expo é acionado quando o app volta a rodar.

#### 5. Recorrência "Diária"

No estado atual, a recorrência é **um metadado informativo** salvo junto ao lembrete. A notificação em si é agendada com `DATE` (dispara uma vez). 

Se quiser fazer a recorrência funcionar de verdade, existem duas abordagens:

- **Reagendamento automático:** quando o usuário toca em "Concluir" em um lembrete marcado como "Diária", o app agenda automaticamente a próxima ocorrência para o dia seguinte.
- **`CALENDAR` trigger (iOS):** usar `SchedulableTriggerInputTypes.CALENDAR` com `hour` e `minute` — só tem suporte completo no iOS.

---

## 🔐 Permissões

O app solicita as seguintes permissões:

| Permissão | Quando é pedida | Para quê |
|---|---|---|
| `POST_NOTIFICATIONS` (Android 13+) | Na primeira execução | Mostrar notificações |
| `SCHEDULE_EXACT_ALARM` (Android 12+) | Adicionada automaticamente pela lib | Agendar notificações em horário exato |

O Expo adiciona essas permissões ao `AndroidManifest.xml` automaticamente quando você usa o plugin `expo-notifications`.

---


## 👤 Autor

Desenvolvido como atividade individual da disciplina de **React Native** — professor Filipe Silva.
