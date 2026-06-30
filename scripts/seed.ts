import { getPayload } from 'payload'
import config from '@payload-config'

const skipRevalidate = { context: { skipRevalidate: true } } as const

const AUTHORS = [
  { email: 'demo@vcontheroad.cv', name: 'Demo Author' },
  { email: 'ada@vcontheroad.cv', name: 'Ada Wren' },
  { email: 'kenji@vcontheroad.cv', name: 'Kenji Shiro' },
  { email: 'iris@vcontheroad.cv', name: 'Iris Halász' },
  { email: 'moussa@vcontheroad.cv', name: 'Moussa Diallo' },
  { email: 'leona@vcontheroad.cv', name: 'Leonor Vargas' },
]

type LexicalNode = Record<string, unknown> & { type: string; version: number }
type LexicalRoot = {
  root: {
    type: 'root'
    format: ''
    indent: number
    version: number
    direction: 'ltr'
    children: LexicalNode[]
  }
}

type LocaleVariant = {
  title: string
  description: string
  paragraphs?: string[]
  buildContent?: (mediaId: number | string) => LexicalRoot
}

type PostSeed = {
  seed: number
  authorIdx: number | null
  tagSlugs?: string[]
  en: LocaleVariant
  zh: LocaleVariant
}

type TagSeed = {
  slug: string
  en: { name: string; description?: string }
  zh: { name: string; description?: string }
}

const TAGS: TagSeed[] = [
  {
    slug: 'slow-travel',
    en: { name: 'Slow travel', description: 'Taking the long way on purpose.' },
    zh: { name: '慢旅行', description: '有意选择更长的那条路。' },
  },
  {
    slug: 'buses-and-trains',
    en: { name: 'Buses & trains', description: 'Notes from public transit.' },
    zh: { name: '巴士与火车', description: '来自公共交通的笔记。' },
  },
  {
    slug: 'food',
    en: { name: 'Food', description: 'Markets, bakeries, and roadside meals.' },
    zh: { name: '饮食', description: '集市、面包店与路边餐食。' },
  },
  {
    slug: 'weather',
    en: { name: 'Weather', description: 'Rain, cloud, and the forecasts that lie.' },
    zh: { name: '天气', description: '雨、云，以及那些撒谎的天气预报。' },
  },
  {
    slug: 'letters',
    en: { name: 'Letters', description: 'Postboxes, postcards, and things that may never arrive.' },
    zh: { name: '信件', description: '信箱、明信片，以及可能永远到不了的东西。' },
  },
  {
    slug: 'reference',
    en: { name: 'Reference', description: 'Reference posts for the theme itself.' },
    zh: { name: '参考', description: '主题本身的参考性文章。' },
  },
]

const FMT = {
  BOLD: 1,
  ITALIC: 2,
  STRIKE: 4,
  UNDERLINE: 8,
  CODE: 16,
  SUB: 32,
  SUP: 64,
} as const

const t = (text: string, format = 0): LexicalNode => ({
  type: 'text',
  format,
  mode: 'normal',
  style: '',
  text,
  detail: 0,
  version: 1,
})

type Align = '' | 'left' | 'center' | 'right' | 'justify'

const paragraph = (
  children: LexicalNode[],
  opts: { format?: Align; indent?: number } = {},
): LexicalNode => ({
  type: 'paragraph',
  format: opts.format ?? '',
  indent: opts.indent ?? 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  textStyle: '',
  children,
})

const heading = (
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  children: LexicalNode[],
): LexicalNode => ({
  type: 'heading',
  tag,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children,
})

const link = (
  url: string,
  children: LexicalNode[],
  { newTab = true }: { newTab?: boolean } = {},
): LexicalNode => ({
  type: 'link',
  fields: { linkType: 'custom', url, newTab },
  format: '',
  indent: 0,
  version: 3,
  direction: 'ltr',
  children,
})

const listitem = (
  children: LexicalNode[],
  opts: { checked?: boolean; value?: number } = {},
): LexicalNode => ({
  type: 'listitem',
  value: opts.value ?? 1,
  ...(opts.checked !== undefined && { checked: opts.checked }),
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children,
})

const list = (
  listType: 'bullet' | 'number' | 'check',
  items: LexicalNode[],
): LexicalNode => ({
  type: 'list',
  listType,
  start: 1,
  tag: listType === 'number' ? 'ol' : 'ul',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: items,
})

const quote = (children: LexicalNode[]): LexicalNode => ({
  type: 'quote',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children,
})

const hr = (): LexicalNode => ({ type: 'horizontalrule', version: 1 })

const upload = (mediaId: number | string): LexicalNode => ({
  type: 'upload',
  fields: {},
  format: '',
  relationTo: 'media',
  value: mediaId,
  version: 3,
})

const rootOf = (children: LexicalNode[]): LexicalRoot => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children,
  },
})

function buildShowcaseContentEn(mediaId: number | string): LexicalRoot {
  return rootOf([
    heading('h1', [t('A complete formatting showcase')]),
    paragraph([
      t('This post exercises every default Lexical feature — '),
      t('bold', FMT.BOLD),
      t(', '),
      t('italic', FMT.ITALIC),
      t(', '),
      t('underline', FMT.UNDERLINE),
      t(', '),
      t('strikethrough', FMT.STRIKE),
      t(', '),
      t('inline code', FMT.CODE),
      t(', and combinations like '),
      t('bold italic underlined', FMT.BOLD | FMT.ITALIC | FMT.UNDERLINE),
      t('.'),
    ]),
    heading('h2', [t('Heading levels')]),
    heading('h3', [t('Third-level heading')]),
    heading('h4', [t('Fourth-level heading')]),
    heading('h5', [t('Fifth-level heading')]),
    heading('h6', [t('Sixth-level heading')]),
    heading('h2', [t('Subscript and superscript')]),
    paragraph([
      t('Water is H'),
      t('2', FMT.SUB),
      t('O, and Einstein reminded us that E = mc'),
      t('2', FMT.SUP),
      t('.'),
    ]),
    heading('h2', [t('Alignment')]),
    paragraph([t('This paragraph is left-aligned by default.')]),
    paragraph([t('This paragraph is centred.')], { format: 'center' }),
    paragraph([t('This paragraph hugs the right edge.')], { format: 'right' }),
    paragraph(
      [
        t(
          'This paragraph is justified so that both edges line up along the measure, which takes a few sentences before the effect is actually visible.',
        ),
      ],
      { format: 'justify' },
    ),
    heading('h2', [t('Indentation')]),
    paragraph([t('An indented paragraph is pushed inward one level.')], { indent: 1 }),
    paragraph([t('Two levels of indentation walk the paragraph further in.')], { indent: 2 }),
    heading('h2', [t('Unordered list')]),
    list('bullet', [
      listitem([t('Coffee first, itinerary second.')]),
      listitem([t('Trains will wait for no one.')]),
      listitem([t('The third street is usually the right one.')]),
    ]),
    heading('h2', [t('Ordered list')]),
    list('number', [
      listitem([t('Arrive at the station exactly on time.')], { value: 1 }),
      listitem([t('Do not run — trains you chase become trains you miss.')], { value: 2 }),
      listitem([t('Find the bench, order the coffee, and wait.')], { value: 3 }),
    ]),
    heading('h2', [t('Checklist')]),
    list('check', [
      listitem([t('Pack a reusable water bottle.')], { checked: true, value: 1 }),
      listitem([t('Exchange currency before the bus station.')], { checked: true, value: 2 }),
      listitem([t('Send the postcards you bought last week.')], { checked: false, value: 3 }),
    ]),
    heading('h2', [t('Blockquote')]),
    quote([t('The road used to be worse, and somehow I miss it.')]),
    heading('h2', [t('Links')]),
    paragraph([
      t('Read more on the '),
      link('/about', [t('about page')], { newTab: false }),
      t(', or visit the '),
      link('https://payloadcms.com', [t('Payload website')]),
      t(' to see how this content is authored.'),
    ]),
    heading('h2', [t('Inline image')]),
    upload(mediaId),
    heading('h2', [t('Horizontal rule')]),
    paragraph([t('Before the divider.')]),
    hr(),
    paragraph([t('After the divider.')]),
  ])
}

function buildShowcaseContentZh(mediaId: number | string): LexicalRoot {
  return rootOf([
    heading('h1', [t('完整的排版展示')]),
    paragraph([
      t('这篇文章用到了 Lexical 的每一项默认功能——'),
      t('粗体', FMT.BOLD),
      t('、'),
      t('斜体', FMT.ITALIC),
      t('、'),
      t('下划线', FMT.UNDERLINE),
      t('、'),
      t('删除线', FMT.STRIKE),
      t('、'),
      t('行内代码', FMT.CODE),
      t('，以及像'),
      t('粗体斜体加下划线', FMT.BOLD | FMT.ITALIC | FMT.UNDERLINE),
      t('这样的组合。'),
    ]),
    heading('h2', [t('标题级别')]),
    heading('h3', [t('三级标题')]),
    heading('h4', [t('四级标题')]),
    heading('h5', [t('五级标题')]),
    heading('h6', [t('六级标题')]),
    heading('h2', [t('下标与上标')]),
    paragraph([
      t('水是 H'),
      t('2', FMT.SUB),
      t('O，爱因斯坦也提醒我们 E = mc'),
      t('2', FMT.SUP),
      t('。'),
    ]),
    heading('h2', [t('对齐')]),
    paragraph([t('这段文字默认左对齐。')]),
    paragraph([t('这段文字居中。')], { format: 'center' }),
    paragraph([t('这段文字贴着右边缘。')], { format: 'right' }),
    paragraph(
      [
        t(
          '这一段是两端对齐的，需要写够几句之后，两边对齐的排版效果才会真正显现出来。',
        ),
      ],
      { format: 'justify' },
    ),
    heading('h2', [t('缩进')]),
    paragraph([t('这一段向内缩进了一级。')], { indent: 1 }),
    paragraph([t('再多一级缩进，段落会继续向里走。')], { indent: 2 }),
    heading('h2', [t('无序列表')]),
    list('bullet', [
      listitem([t('先喝咖啡，再看行程。')]),
      listitem([t('火车不会等任何人。')]),
      listitem([t('第三条街通常是对的那一条。')]),
    ]),
    heading('h2', [t('有序列表')]),
    list('number', [
      listitem([t('准时到车站。')], { value: 1 }),
      listitem([t('不要追——你追的车只会让你错过得更用力。')], { value: 2 }),
      listitem([t('找到长椅，点好咖啡，然后等。')], { value: 3 }),
    ]),
    heading('h2', [t('检查列表')]),
    list('check', [
      listitem([t('带上一只可以重复使用的水瓶。')], { checked: true, value: 1 }),
      listitem([t('上车之前换好当地货币。')], { checked: true, value: 2 }),
      listitem([t('把上周买的明信片寄出去。')], { checked: false, value: 3 }),
    ]),
    heading('h2', [t('引用块')]),
    quote([t('这条路从前更糟，而我竟然有些想念它。')]),
    heading('h2', [t('链接')]),
    paragraph([
      t('更多内容请见'),
      link('/about', [t('关于页面')], { newTab: false }),
      t('，或者访问 '),
      link('https://payloadcms.com', [t('Payload 官网')]),
      t('，看看这些内容是如何编辑的。'),
    ]),
    heading('h2', [t('行内图片')]),
    upload(mediaId),
    heading('h2', [t('分割线')]),
    paragraph([t('分割线之前。')]),
    hr(),
    paragraph([t('分割线之后。')]),
  ])
}

const POSTS: PostSeed[] = [
  {
    seed: 1011,
    authorIdx: 0,
    tagSlugs: ['slow-travel', 'buses-and-trains'],
    en: {
      title: 'Dispatch from the slow lane',
      description:
        'A mountain bus, a humming driver, and an afternoon that refuses to have a destination.',
      paragraphs: [
        'The bus wheezes over the pass and I stop trying to make good time. There is a cafe at every second bend and a dog at every third, and none of them are in a hurry. Somewhere between the last village and the next, I give up on the idea that the afternoon has a destination.',
        'The driver pulls over without explanation. He walks across the road, buys a loaf of bread from a woman on a plastic chair, and comes back humming. We move again when the loaf is tucked under his seat and not a moment before.',
        'I have started measuring the day in small things: the colour of the river at noon, how long the bread stays warm, the number of postcards I forgot to send. The list keeps getting longer and the day keeps feeling shorter, which I think is the point.',
        'By evening the bus has halved its passengers and doubled its conversation. An old man tells me that the road used to be worse. I am not sure if this is a complaint or a compliment, and I suspect he is not sure either.',
      ],
    },
    zh: {
      title: '慢车道来信',
      description: '一辆翻山的巴士，一个哼着歌的司机，一个不愿有目的地的午后。',
      paragraphs: [
        '巴士喘着粗气翻过山口，我不再执着于赶时间。每隔两个弯就有一家咖啡馆，每隔三个弯就有一只狗，谁都不着急。在上一个村子和下一个村子之间的某处，我放弃了"这个下午要有个目的地"的想法。',
        '司机没做任何解释就靠边停车。他穿过马路，向一个坐在塑料椅上的女人买了一条面包，然后哼着歌回来。面包被塞进他座位下面之前，车一步都不会再动。',
        '我开始用小事丈量这一天：河水在正午的颜色、面包还能温热多久、我忘了寄的明信片有几张。清单越来越长，日子越来越短，我想这大概就是重点所在。',
        '傍晚时车上的乘客少了一半，谈话声却多了一倍。一位老人告诉我这条路以前更糟。我分不清这是一句抱怨还是夸奖，我怀疑他自己也分不清。',
      ],
    },
  },
  {
    seed: 1025,
    authorIdx: 1,
    tagSlugs: ['slow-travel', 'letters'],
    en: {
      title: 'Notes on impermanence',
      description:
        'Hostel bookshelves, pencilled itineraries, and the small trades travellers make without announcing them.',
      paragraphs: [
        'Every hostel has a shelf of books abandoned by earlier travellers. You take one, leave one, and the library quietly rewrites itself each week. Someone once left a thriller with the last chapter torn out, and someone else — presumably — left with it.',
        'I have begun to suspect that the itinerary is a kind of book too — written in pencil, revised by weather. The pages you were most excited about are rarely the ones you end up underlining.',
        'A woman from Marseille tells me she has been travelling for eleven months. She does not say where she is going next, and I realise I have stopped asking people that question. It is a greeting, mostly, like asking about the weather at home.',
        'The shelf this morning has a Spanish grammar, a battered copy of Le Petit Prince, and a novel in a script I cannot read. I take the grammar. I leave a notebook I was not using. Fair trade, I think, at least until I need the notebook again.',
        'Later, on the terrace, a man is reading my discarded notebook and laughing at something I wrote three towns ago. I decide not to correct him. He is enjoying it more than I did.',
      ],
    },
    zh: {
      title: '无常札记',
      description: '青旅的书架、用铅笔写下的行程，以及旅人不动声色完成的小小交换。',
      paragraphs: [
        '每家青旅都有一排被之前的旅人留下的书。你带走一本，留下一本，这家小图书馆每周都在悄悄重写自己。有人曾经留下过一本被撕掉最后一章的惊悚小说，而另一个人——大概——带着那一章离开了。',
        '我开始怀疑行程本身也是一种书——用铅笔写就，被天气反复修改。那些最让你期待的书页，往往不是你最后真的划线的那几页。',
        '一个来自马赛的女人告诉我，她已经在路上十一个月了。她没说下一站去哪里，我意识到自己也已经不再问人这个问题了。它更像是一句问候，像问家乡的天气。',
        '今天早上书架上有一本西班牙语语法书、一本破旧的《小王子》，还有一本我看不懂文字的小说。我拿走了那本语法书，留下了一本自己没在用的笔记本。公平交易，我想，至少在我再次需要那本笔记本之前是公平的。',
        '后来，在露台上，一个男人正在读我留下的笔记本，对着我三个城镇以前写的一句话发笑。我决定不去纠正他。他读得比我当初写的时候更开心。',
      ],
    },
  },
  {
    seed: 1043,
    authorIdx: 2,
    tagSlugs: ['slow-travel'],
    en: {
      title: 'Between checkpoints',
      description:
        'A stamped passport, a free lemon, and a shepherd who only wanted to know the shape of the day.',
      paragraphs: [
        'The border guard asks where I am going and I answer honestly: nowhere in particular. He frowns at the passport for a full minute, then at me, then stamps it anyway. I take this as a small victory against bureaucracy, though I suspect he took it as one against me.',
        'For two hours the road has no shoulder and no shade. Then, without warning, an olive grove, and a woman selling lemons from a folding table. I buy three. She gives me a fourth because, she says, I look like I have been walking for longer than I think.',
        'A shepherd stops me to ask the time. I show him my phone. He looks at it for a moment, nods gravely, and walks on. I do not think he was asking about minutes. I think he was confirming that the world had not ended since breakfast.',
        'By dusk I have crossed into a country where my phone loses signal politely, as though apologising. The last bar flickers and is gone. I keep walking, now measuring distance in the spaces between dogs barking from different farms.',
      ],
    },
    zh: {
      title: '关卡之间',
      description: '盖了章的护照、白送的一只柠檬，以及一个只想知道今天大概是什么形状的牧羊人。',
      paragraphs: [
        '边境警察问我要去哪里，我如实回答：没有什么特别要去的地方。他对着护照皱了整整一分钟眉，然后又对着我皱眉，最后还是盖了章。我把这当作对官僚体制的一次小小胜利，尽管我怀疑他把这当作对我的一次小小胜利。',
        '有两个小时，这条路既没有路肩也没有阴凉。然后，毫无预兆地，出现了一片橄榄林和一个在折叠桌后面卖柠檬的女人。我买了三个。她又多送了我一个，说我看上去走的路比我以为的要久。',
        '一个牧羊人拦住我问时间。我把手机给他看。他看了一会儿，郑重地点点头，然后走开了。我不觉得他真的在问几分几秒。我觉得他只是在确认，这个世界从早饭之后到现在还没有结束。',
        '天黑时我已经进入了另一个国家，手机信号像是在道歉一样彬彬有礼地消失了。最后一格信号闪了闪就没了。我继续往前走，此刻用不同农场里狗叫声之间的间隔来丈量距离。',
      ],
    },
  },
  {
    seed: 1061,
    authorIdx: 1,
    tagSlugs: ['weather', 'letters'],
    en: {
      title: 'Waking up in unfamiliar weather',
      description:
        'The forecast lies, the shutters open onto a cloud, and the day quietly redrafts itself over candles and tea.',
      paragraphs: [
        'The forecast said sun. I opened the shutters to a cloud so low it had moved into the room with me. For a while I simply stood there, letting it in or out, uncertain which way the exchange was going.',
        'There is a particular pleasure in being wrong about a day before it has properly begun. You have to cancel the plan you did not really want to execute, and invent one that costs less in both money and resolve.',
        'Downstairs the cafe has put out candles at ten in the morning. Three strangers are sharing a pot of tea as if they had agreed to it in advance. The rain outside is so even it sounds like a machine, which is to say: perfectly, boringly, generously reliable.',
        'I write two postcards. I lose one. The other makes it home three weeks later, and by then I have forgotten what it says. My mother calls to tell me. She sounds pleased, as if I had sent her a small piece of a weather I no longer remember.',
      ],
    },
    zh: {
      title: '在陌生的天气里醒来',
      description: '天气预报撒了谎，推开百叶窗迎面是一团云，这一天在烛光与茶水间悄悄重写了自己。',
      paragraphs: [
        '天气预报说今天晴。我推开百叶窗，迎面是一团低得仿佛已经搬进房间里和我同住的云。我就那样站了一会儿，任它进来或出去，不太确定这场交换究竟朝哪个方向进行。',
        '在一天还没真正开始之前就猜错它，是一种特别的快乐。你必须取消那个自己本来也不太想执行的计划，再临时编一个在金钱和决心上都成本更低的版本。',
        '楼下的咖啡馆早上十点就点起了蜡烛。三位陌生人共用一壶茶，好像事先商量过一样。外面的雨下得非常均匀，听起来像一台机器，也就是说：完美、乏味、慷慨地可靠。',
        '我写了两张明信片。弄丢了一张。另一张三周后到了家，那时我已经忘了自己在上面写了什么。母亲打电话告诉我。她听起来很高兴，好像我寄给她的是一小块自己已经记不得的天气。',
      ],
    },
  },
  {
    seed: 1072,
    authorIdx: null,
    tagSlugs: ['buses-and-trains', 'slow-travel'],
    en: {
      title: 'A field guide to missing trains',
      description:
        'Five rules for letting a train leave without you — and for making the extra hour feel deliberate.',
      paragraphs: [
        'First: arrive at the station exactly on time. This will feel correct until you reach the platform, at which point the timetable will have quietly renegotiated with reality, and reality will have won.',
        'Second: do not run. Trains you chase become trains you miss with greater effort. Sit on the bench, order a coffee, and wait for the next one as if you had planned it. The bench is usually wooden, the coffee is usually bad, and the timetable is usually honest about the second attempt.',
        'Third: talk to the person next to you, but only after they have finished their pastry. It is considered rude, in most of the countries I have visited, to interrupt a croissant.',
        'Fourth: remember that a missed train is the cheapest way to get an extra hour in a city. Take it. Walk a block you would otherwise have skipped. Find the bakery you were going to miss anyway.',
        'Fifth, and most important: do not tell anyone back home that you missed the train. They will assume you are lost. You are not lost. You are simply catching a later train with more ceremony than you had planned.',
      ],
    },
    zh: {
      title: '错过火车的实用指南',
      description: '让火车抛下你的五条规则，以及把多出来的那一小时过得像故意安排的。',
      paragraphs: [
        '第一条：准时到站。这听起来没毛病，直到你走上站台——那时时刻表已经悄悄和现实重新谈过判，而现实赢了。',
        '第二条：不要跑。你追的火车，只会让你错过得更用力。坐到长椅上，点一杯咖啡，等下一班车，仿佛这本来就是计划的一部分。长椅通常是木头做的，咖啡通常很难喝，而时刻表对下一班车通常比较诚实。',
        '第三条：可以跟旁边的人说话，但要等他吃完手里的糕点。在我去过的大多数国家里，打断一个正在吃可颂的人都是失礼的。',
        '第四条：记住，错过一班火车，是在一个城市多待一小时最便宜的方式。就享受它。走过一个你本来会略过的街区。找到那家你本来也会错过的面包店。',
        '第五条，也是最重要的一条：不要告诉家里的人你错过了火车。他们会以为你走丢了。你没走丢。你只是以一种比原计划更隆重的仪式，坐下一班车。',
      ],
    },
  },
  {
    seed: 1089,
    authorIdx: 0,
    tagSlugs: ['food'],
    en: {
      title: 'Sidestreets and good coffee',
      description:
        'A three-street rule for finding the right cafe, tested from Lisbon to Hanoi with mixed but honest results.',
      paragraphs: [
        'The main square is for tourists. The second street is for locals. The third street is where the coffee gets good and the rent is still reasonable. I have yet to find a city where this rule is wrong, though I have been in several where I needed a patient friend to explain it.',
        'In Lisbon the third street smells of sardines. In Istanbul it smells of something I could not name and was afraid to ask about. In Hanoi the third street is not a street at all but a sequence of plastic stools that reorganise themselves each hour.',
        'The barista this morning is maybe nineteen. He pulls two shots without looking at the machine and asks me, in careful English, what I am reading. I show him the cover. He nods the way people nod at a choice they respect but would not make.',
        'Outside, a man is arguing with a parking meter. I do not know the language and yet I understand him completely. The meter, as meters do, wins without answering.',
      ],
    },
    zh: {
      title: '小巷与好咖啡',
      description: '从里斯本到河内都试过的"第三条街"规则：找到对的咖啡馆——结果参差，但诚实。',
      paragraphs: [
        '主广场是留给游客的。第二条街是留给本地人的。第三条街，是咖啡变好喝、房租还能接受的地方。我还没在哪个城市发现这条规则错过，尽管有好几个城市里我得靠一个有耐心的朋友来替我解释。',
        '在里斯本，第三条街闻起来是沙丁鱼的味道。在伊斯坦布尔，它闻起来是一种我叫不出、也不敢问的味道。在河内，第三条街根本不是一条街，而是一排塑料凳，每小时重新排列一次。',
        '今早的咖啡师大概十九岁。他头也不抬地做出了两杯 espresso，然后用小心翼翼的英语问我在读什么。我把封面给他看。他点点头——是那种对一个你会尊重但自己不会做出的选择时才会点的头。',
        '外面，有个男人正在和停车计时器吵架。我不懂那门语言，却完全明白他在说什么。计时器，一如既往，不作回答就赢了。',
      ],
    },
  },
  {
    seed: 1097,
    authorIdx: null,
    tagSlugs: ['slow-travel', 'buses-and-trains'],
    en: {
      title: 'The quiet parts of the map',
      description:
        'The bus crosses unlabelled country, and the window makes a slow case against the idea of empty places.',
      paragraphs: [
        'Between the named places there are long stretches of nothing, which is to say: everything. Fences. Power lines. A hawk over a field of nothing-in-particular. A tractor parked, perhaps permanently, at the edge of a crop I cannot identify.',
        'The map calls it empty. The window disagrees. A herd of goats crosses the road and the driver slows down without annoyance, as if this had been on the schedule all along.',
        'I think about how much of travel is the effort of paying attention to parts of the journey that were never meant to be destinations. The bus stops in a town whose name I cannot remember an hour later, and yet I can still describe the dog that watched it leave.',
        'At the next named place, a woman sells me a sandwich I do not want. I eat it anyway. It is not a good sandwich, but it is a specific one. I will remember it longer than the town.',
      ],
    },
    zh: {
      title: '地图上安静的部分',
      description: '巴士穿过没有名字的乡野，车窗慢慢地为所谓的"空地"提出异议。',
      paragraphs: [
        '在有名字的地方之间，是一段段什么都没有的地带，也就是说：什么都有。围栏。电线。一只鹰盘旋在一块没什么特别之处的田上。一辆拖拉机，也许永久地停在一片我认不出的庄稼边上。',
        '地图说那里是空的。车窗不同意。一群山羊横穿公路，司机毫不烦躁地放慢了速度，仿佛这件事本就写在时刻表上。',
        '我在想，旅行有多大一部分其实是努力去留意那些从一开始就不是目的地的段落。巴士在一个小镇停下，我一小时后就记不住那个小镇的名字，却依然可以描述出看着它离开的那只狗。',
        '到了下一个有名字的地方，一个女人卖给我一个我并不想要的三明治。我还是吃了。那不是一个好吃的三明治，但它是一个具体的三明治。我记得它比记得那个小镇更久。',
      ],
    },
  },
  {
    seed: 1108,
    authorIdx: 2,
    tagSlugs: ['slow-travel'],
    en: {
      title: 'Long evenings, short notes',
      description:
        'A summer that refuses to end, a notebook filled one sentence per hour, and a neighbour with three chords.',
      paragraphs: [
        'In summer the light stretches past dinner and the notebook fills up slowly. One sentence per hour is a reasonable pace for a day that refuses to end. I am not writing anything useful. I am writing because the pen is out and the evening is holding still.',
        'By the time it is dark enough to sleep I have written almost nothing, and remembered almost everything. The two feel like the same activity carried out on different equipment.',
        'A neighbour plays the same three chords on a guitar, over and over, from an open window across the courtyard. It should be annoying. It is not. It is the closest thing I have had to a metronome in weeks.',
        'I close the notebook without reading what I wrote. Tomorrow I will find it at the bottom of the bag and pretend to be surprised. This is part of the arrangement.',
      ],
    },
    zh: {
      title: '长长的傍晚，短短的笔记',
      description: '一个拒绝结束的夏天、一本每小时只写一句话的笔记本，以及一位只会三个和弦的邻居。',
      paragraphs: [
        '夏天，光线一直延伸到晚餐之后，笔记本慢慢地被填满。对于一个拒绝结束的日子来说，每小时写一句话是一个合理的节奏。我并没有在写什么有用的东西。我只是在写，因为笔已经拿出来了，而傍晚正静止着。',
        '等到天黑得足以睡觉的时候，我几乎什么都没写，却几乎什么都记起来了。这两件事，感觉像是用不同的工具做的同一件事。',
        '一位邻居从院子对面敞开的窗户里，一遍又一遍地用吉他弹同样的三个和弦。这本该让人烦躁。可并没有。这是我几周以来最接近节拍器的东西。',
        '我合上笔记本，没去读自己写下的话。明天我会在包的底部找到它，再假装很惊讶。这也是安排的一部分。',
      ],
    },
  },
  {
    seed: 1121,
    authorIdx: 3,
    tagSlugs: ['food', 'slow-travel'],
    en: {
      title: 'Market days',
      description:
        'Rival tomatoes, a mystery preserve in a glass jar, and a market folding itself away before noon.',
      paragraphs: [
        'The market begins before the sun and ends when the bread runs out. I arrive somewhere in the middle, which means I miss the serious shoppers and join the people who came for a reason they have not entirely worked out.',
        'A woman selling tomatoes tells me hers are the best. The woman three stalls down tells me the same thing with equal conviction. I buy from both, in the interest of diplomacy. Both are, predictably, excellent.',
        'There is a stall that sells only one thing: a yellow preserve in a glass jar. I ask what it is made of. The man shrugs and says it has been in his family for forty years. I do not buy any. He does not seem to mind. I suspect no one buys any. I suspect that is the point.',
        'By noon the stalls begin folding themselves away with the efficiency of a circus. A child is sweeping up tomato stems with a broom twice her height. I linger by the bread, which has indeed run out, and buy a pastry instead. It is still warm. The day has not yet decided what it wants to be.',
      ],
    },
    zh: {
      title: '赶集日',
      description: '彼此较劲的番茄、玻璃罐里的神秘果酱，以及一场正午之前就收摊回家的集市。',
      paragraphs: [
        '集市在太阳升起之前就开始，到面包卖完时结束。我大约在中间某个时刻到达，这意味着我错过了认真的买家，加入了一群自己也没完全想清楚为什么要来的人。',
        '一个卖番茄的女人告诉我她的是最好的。隔着三个摊位的另一位女人以同样的信心告诉我同样的话。出于外交上的考虑，我从两家都买了。两家的番茄，意料之中都很好。',
        '有一个摊位只卖一样东西：玻璃罐里的一种黄色果酱。我问是用什么做的。男人耸耸肩，说这东西在他家里已经四十年了。我没买。他似乎并不介意。我怀疑从来没人买过。我怀疑这正是重点。',
        '到中午时，摊位们以马戏团收场般的效率开始把自己折叠起来。一个孩子用比自己高两倍的扫帚扫着番茄蒂。我在面包摊前停留——面包果然已经卖完——只好买了一个糕点。它还是温的。今天还没决定自己要成为什么样。',
      ],
    },
  },
  {
    seed: 1136,
    authorIdx: 4,
    tagSlugs: ['slow-travel'],
    en: {
      title: 'Small rooms, large windows',
      description:
        'Fifteen euros, a borrowed view of the sea, a landlady with opinions, and a cat that belongs to no one.',
      paragraphs: [
        'The room costs fifteen euros and has a window that faces a wall. The wall, however, has a window of its own, and through that one I can see a slice of the sea, or else a very convincing impersonation of one. I choose to believe the sea.',
        'The landlady is called Stella. She has opinions about how long I will stay and when I will leave, and both are inaccurate, and both are offered with the confidence of a weather forecaster. I adjust my plans to fit hers. It is easier than arguing, and she is probably right.',
        "Every morning a cat visits. It is not her cat, she says; it is not anyone's cat. It is the cat of the landing. It drinks water from a saucer that appears on its own, and leaves before anyone can thank it. I admire this.",
        'On my last evening Stella gives me a tomato and a piece of advice. I remember the tomato better than the advice, but I am fairly sure the advice was also about tomatoes. I eat it on the train and try to take it seriously.',
      ],
    },
    zh: {
      title: '小房间，大窗户',
      description: '十五欧元、一块借来的海景、一位有主见的房东太太，以及一只谁也不属于的猫。',
      paragraphs: [
        '这个房间十五欧元，窗户正对着一堵墙。不过，那堵墙自己也有一扇窗，透过它我能看到一小片海，或者一场非常逼真的关于海的模仿。我选择相信那就是海。',
        '房东太太叫斯特拉。她对我会住多久、会在什么时候离开都有自己的看法，两者都不准确，两者都以气象预报员那样的自信说出。我调整自己的计划去配合她的。这比跟她争论容易，而且她大概是对的。',
        '每天早上都有一只猫来。她说，那不是她的猫；也不是任何人的猫。那是楼梯平台的猫。它从一只自己出现的碟子里喝水，然后在任何人来得及道谢之前离开。我非常欣赏这一点。',
        '我离开的最后一个傍晚，斯特拉给了我一个番茄和一条建议。我记得番茄比记得建议更清楚，但我相当确定那条建议也是关于番茄的。我在火车上吃掉了番茄，并试图认真对待它。',
      ],
    },
  },
  {
    seed: 1149,
    authorIdx: 5,
    tagSlugs: ['weather'],
    en: {
      title: 'Rain on the wrong continent',
      description:
        'Three days of steady rain, a new pair of shoes, and a quiet line about a season that keeps shifting.',
      paragraphs: [
        'It has been raining for three days. Not badly — the way it rains in places where rain is normal — but steadily, the way a sentence keeps going past its own point. The guesthouse smells of wet wood and a little of fried garlic. Both smells belong here.',
        'My shoes are, frankly, finished. I buy a pair from a shop run by a man who disapproves of tourists and yet sells them shoes anyway. He sizes me by eye and is correct on the first try. I pay without bargaining. We part with mutual, grudging respect.',
        'The rain changes the city in small, accurate ways. The older buildings suddenly look like they were designed for this weather, because they were. The new buildings look annoyed. People have adjusted their walking speeds to match the drainage, which is to say, the old parts are faster than the new.',
        'At dinner a woman explains that the season has been shifting for years. She says it without drama, the way you might describe a neighbour slowly moving the fence. I write it down. I do not know what to do with it yet. I suspect that is part of the problem.',
      ],
    },
    zh: {
      title: '下错大陆的雨',
      description: '连续三天的雨、一双新鞋，以及一句关于季节正悄悄挪动的平静话。',
      paragraphs: [
        '雨已经下了三天。不算大——就像雨水稀松平常的地方下的那种雨——但一直没停，像一句话越过了自己的要点还在继续。旅馆里闻起来是湿木头的味道，还带着一点炸蒜。两种味道都属于这里。',
        '我的鞋，说实话，已经彻底完了。我在一家小店买了一双新的，店主不喜欢游客，但还是把鞋卖给他们。他用眼睛估我的尺码，第一次就猜对。我没还价就付了钱。我们带着彼此勉强的敬意告别。',
        '雨以细小而精确的方式改变着这座城市。老建筑突然看上去就是为这种天气设计的——因为它们本来就是。新建筑看上去则有些不悦。人们根据下水道的处理速度调整了自己走路的速度，也就是说，老城区比新城区走得更快。',
        '晚饭时，一个女人解释说季节已经挪动好几年了。她说得不动声色，就像描述一个慢慢挪动篱笆的邻居一样。我把这句话记下来。我还不知道该拿它怎么办。我怀疑这正是问题的一部分。',
      ],
    },
  },
  {
    seed: 1162,
    authorIdx: 3,
    tagSlugs: ['buses-and-trains', 'slow-travel'],
    en: {
      title: 'The language of buses',
      description:
        'Six hours across a featureless plain, a shared slice of orange, and a dog on duty at an empty station.',
      paragraphs: [
        'Intercity buses are mostly quiet in the way libraries are quiet — not silent, but agreed upon. Someone is eating an apple. Someone is pretending to sleep. Someone is arguing softly with their phone in a language I cannot place.',
        'I have been riding this route for six hours. The driver has changed twice and the upholstery once. The scenery has shifted from olive groves to a kind of high, flat plain, which I can only describe as a country politely declining to have any features.',
        'A woman next to me shares a slice of orange without saying anything. I thank her in the wrong language. She smiles as if this was also to be expected. For a while I am briefly, completely at home.',
        'We arrive after dark. The station is empty in the way only bus stations are empty: not abandoned, just between events. A dog watches me from across the forecourt. I nod at the dog. The dog does not nod back, but I think we understand each other.',
      ],
    },
    zh: {
      title: '巴士的语言',
      description: '六小时穿过一片毫无特征的平原、一瓣分享来的橘子，以及一条在空荡车站值班的狗。',
      paragraphs: [
        '城际巴士大多安静，是图书馆那种安静——不是完全无声，而是达成了某种共识。有人在吃苹果。有人在假装睡觉。有人用一种我说不出名字的语言对着手机轻声吵架。',
        '这条线路我已经坐了六个小时。司机换过两次，座椅换过一次。风景从橄榄林变成一种高而平坦的平原，我只能把它形容成一个礼貌地拒绝拥有任何特征的国家。',
        '坐在我旁边的女人一句话不说，就分给我一瓣橘子。我用错了语言向她道谢。她笑了笑，仿佛这也在意料之中。有那么一段时间，我短暂而彻底地感到自己回到了家。',
        '我们天黑之后才到。车站空荡的方式只有汽车站才有：不是被废弃，只是处在两件事之间。一只狗从前厅对面注视着我。我冲它点头。狗没有点头，但我相信我们彼此理解。',
      ],
    },
  },
  {
    seed: 1174,
    authorIdx: 4,
    tagSlugs: ['letters'],
    en: {
      title: 'Letters that never arrive',
      description:
        'Postboxes as acts of faith, a padlocked box outside a pharmacy, and a reply written by a stranger.',
      paragraphs: [
        'Somewhere in the postal system of a country I have already left, a letter I wrote last month is still making its decisions. I know this because the person it was addressed to has written to ask where it is. I have no idea. It has become a small, hopeful wildlife.',
        'Writing letters abroad is an act of faith rather than communication. You are not really asking the post office to deliver something; you are asking it to remember that you exist. Some days it agrees. Some days it is busy.',
        'I keep writing them anyway, and I keep posting them in whatever box looks official enough. The box outside the pharmacy in a town I will not revisit has a padlock on it and a sticker I cannot read. I posted three letters there. Two have arrived so far, and the third may yet become a story of its own.',
        'The best letter I have received this year was from a stranger who picked up one I dropped in a cafe and finished it for me. She was kinder to me, on the second half of the page, than I had been willing to be. I still have it. I am not sure how to reply to a letter I started.',
      ],
    },
    zh: {
      title: '永远没到的信',
      description: '把投信视作一种信仰、药店门口上了锁的信箱，以及一封由陌生人代写的回信。',
      paragraphs: [
        '在一个我已经离开的国家的邮政系统的某处，我上个月写的一封信还在做它自己的决定。我之所以知道，是因为收信人写信来问它到底在哪里。我不知道。它已经变成了一只小小的、充满希望的野生动物。',
        '在国外写信是一种信仰行为，而不是一种沟通。你其实不是在请求邮局送达什么，你是在请求它记得你存在。某些日子它愿意答应。某些日子它太忙。',
        '我还是一直在写，一直把它们投进任何一个看起来足够正式的信箱。那个我不会再去的小镇上，药店门口的信箱挂着一把锁，上面还贴着一张我看不懂的贴纸。我在那里投了三封信。目前到了两封，第三封也许会变成它自己的一个故事。',
        '今年我收到的最好的一封信，来自一个陌生人——她在一家咖啡馆捡到了我掉下的一封信，帮我把它写完。在那页纸的下半部分，她对我比我当时愿意对自己的更温柔。我还留着那封信。我不确定该怎么回一封自己开过头的信。',
      ],
    },
  },
  {
    seed: 1199,
    authorIdx: 0,
    tagSlugs: ['reference'],
    en: {
      title: 'A complete formatting showcase',
      description:
        'Every default rich-text feature rendered in one post — useful as a visual reference for the theme.',
      buildContent: buildShowcaseContentEn,
    },
    zh: {
      title: '完整的排版展示',
      description: '在一篇文章里展示所有默认的富文本功能——可以作为主题的可视参考。',
      buildContent: buildShowcaseContentZh,
    },
  },
  {
    seed: 1188,
    authorIdx: 5,
    tagSlugs: ['slow-travel', 'food'],
    en: {
      title: 'Inventory of a single afternoon',
      description:
        'One delayed ferry, two acceptable coffees, three strangers, four messy pages, and a sunset worth not photographing.',
      paragraphs: [
        'One ferry, delayed. Two coffees, both acceptable. A piece of focaccia eaten on a harbour wall that was warm before it was delicious, and delicious before it was finished.',
        'Three conversations with strangers. The first, short and polite, about the ferry. The second, longer than expected, about the weather and then — somehow — the price of olive oil. The third about nothing I can recall, with someone whose name I never learned, which is to say, the kind you remember longer than the others.',
        'Four pages of the notebook, two of which are just a drawing of the harbour with the ferry in the wrong place. One sketch of a cat. The cat, for the record, was not in the harbour. The cat was inside my head, asking me to draw it.',
        'One sunset, unusually good. The kind that seems aware it is being watched and behaves accordingly. I did not photograph it. I watched it instead, with the focaccia gone and the coffee cold, the ferry eventually arriving in the way ferries arrive: with more noise than necessary, and exactly on time for a schedule no one had agreed to.',
      ],
    },
    zh: {
      title: '一个下午的清单',
      description: '一班晚点的渡轮、两杯还行的咖啡、三位陌生人、四页凌乱的笔记，以及一场值得不被拍下来的日落。',
      paragraphs: [
        '一班渡轮，晚点了。两杯咖啡，都还行。一块在码头墙上吃掉的佛卡夏——温热的时候还没到好吃的程度，好吃的时候还没吃完。',
        '和陌生人聊了三次。第一次简短而礼貌，关于渡轮。第二次比预期更长，关于天气，然后——不知怎么——聊到了橄榄油的价格。第三次聊的内容我一点也想不起来，对方的名字我也从没知道过——也就是说，是那种你比前两次记得都要久的聊天。',
        '笔记本上四页，其中两页只是一幅港口画，渡轮被画在了错误的位置。一只猫的速写。顺便说一下，那只猫并不在港口。那只猫在我脑袋里，要我把它画下来。',
        '一场日落，好得不同寻常。那种仿佛知道自己正被看着、于是表现得体的日落。我没拍照。我只是看着它，佛卡夏吃完了，咖啡凉了，渡轮终于以渡轮该有的方式抵达：发出比需要的更多的声响，准时地赶上一份没人同意过的时刻表。',
      ],
    },
  },
]

function lexicalFromParagraphs(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        textStyle: '',
        children: [
          { type: 'text', format: 0, mode: 'normal', style: '', text, version: 1, detail: 0 },
        ],
      })),
    },
  }
}

function contentFor(variant: LocaleVariant, mediaId: number | string) {
  return variant.buildContent
    ? variant.buildContent(mediaId)
    : lexicalFromParagraphs(variant.paragraphs ?? [])
}

async function fetchImage(seed: number) {
  const res = await fetch(`https://picsum.photos/seed/${seed}/1200/800`)
  if (!res.ok) throw new Error(`picsum fetch failed: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

const payload = await getPayload({ config })

await payload.delete({ collection: 'posts', where: {}, ...skipRevalidate })
await payload.delete({ collection: 'media', where: {} })
await payload.delete({ collection: 'tags', where: {} })

const tagsBySlug = new Map<string, number>()
for (const tag of TAGS) {
  const created = await payload.create({
    collection: 'tags',
    locale: 'zh',
    data: {
      slug: tag.slug,
      name: tag.zh.name,
      ...(tag.zh.description && { description: tag.zh.description }),
    },
  })

  await payload.update({
    collection: 'tags',
    id: created.id,
    locale: 'en',
    data: {
      name: tag.en.name,
      ...(tag.en.description && { description: tag.en.description }),
    },
  })

  tagsBySlug.set(tag.slug, created.id)
}

const authors = []
for (const { email, name } of AUTHORS) {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })
  authors.push(
    existing.docs[0] ??
      (await payload.create({
        collection: 'users',
        data: { email, password: 'demo-password', name },
      })),
  )
}

for (const post of POSTS) {
  const data = await fetchImage(post.seed)

  const media = await payload.create({
    collection: 'media',
    locale: 'zh',
    data: { alt: post.zh.title },
    file: {
      data,
      mimetype: 'image/jpeg',
      name: `${post.seed}.jpg`,
      size: data.byteLength,
    },
  })

  await payload.update({
    collection: 'media',
    id: media.id,
    locale: 'en',
    data: { alt: post.en.title },
  })

  const tagIds = (post.tagSlugs ?? [])
    .map((slug) => tagsBySlug.get(slug))
    .filter((id): id is number => id !== undefined)

  const created = await payload.create({
    collection: 'posts',
    locale: 'zh',
    data: {
      title: post.zh.title,
      slug: slugify(post.en.title),
      cover: media.id,
      description: post.zh.description,
      content: contentFor(post.zh, media.id),
      _status: 'published',
      ...(tagIds.length > 0 && { tags: tagIds }),
      ...(post.authorIdx !== null &&
        authors[post.authorIdx] && { author: authors[post.authorIdx]!.id }),
    },
    ...skipRevalidate,
  })

  await payload.update({
    collection: 'posts',
    id: created.id,
    locale: 'en',
    data: {
      title: post.en.title,
      description: post.en.description,
      content: contentFor(post.en, media.id),
      _status: 'published',
    },
    ...skipRevalidate,
  })
}

payload.logger.info(
  `Seeded ${POSTS.length} posts (zh + en) across ${authors.length} authors and ${TAGS.length} tags.`,
)
