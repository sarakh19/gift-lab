# مصادر الصور والخط — تحديث التصميم

الصور فوتوغرافية مؤقتة لعرض التصميم، وليست صور منتجات جيفت لاب المعتمدة ولا وصفًا دقيقًا لمحتوياتها أو خاماتها. لا توجد صور مولدة في هذا التحديث. نُزّلت نسخ محسّنة محليًا لتجنب اعتماد تشغيل الواجهة على خوادم الصور الخارجية. لكل بطاقة صورة مختلفة، وصورتا الترحيب والتخصيص مستقلتان.

| الاستخدام            | الملف داخل public/images | المصور والمصدر                                                                                                         |
| -------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| مبخرة لطف p1         | incense-ceramic.jpg      | [五玄土 ORIENTO — Unsplash](https://unsplash.com/photos/teal-container-on-brown-wooden-desk-Kmoc9lIexUc)               |
| بوكس لحظة فرح p2     | 23784969.jpg             | [Adriana Coulson — Pexels](https://www.pexels.com/photo/gift-on-a-wooden-table-23784969/)                              |
| عطر أثر p3           | 10533996.jpg             | [Ron Lach — Pexels](https://www.pexels.com/photo/glass-bottle-of-perfume-on-table-10533996/)                           |
| توزيعة بداية حلوة p4 | 4271696.jpg              | [alleksana — Pexels](https://www.pexels.com/photo/a-small-box-with-a-ribbon-4271696/)                                  |
| مبخرة دفء p5         | 40382309.jpg             | [Christina & Peter — Pexels](https://www.pexels.com/photo/rustic-incense-burner-with-aromatic-smoke-40382309/)         |
| بوكس فخر p6          | 7826283.jpg              | [Nataliya Vaitkevich — Pexels](https://www.pexels.com/photo/gift-boxes-on-the-floor-7826283/)                          |
| عطر نسمة p7          | 8450250.jpg              | [MART PRODUCTION — Pexels](https://www.pexels.com/photo/a-white-flowers-near-the-perfume-bottle-on-the-table-8450250/) |
| توزيعة ليلة فرح p8   | 17575750.jpg             | [ömer aliko — Pexels](https://www.pexels.com/photo/gift-boxes-close-up-17575750/)                                      |
| بوكس أهلًا صغيرنا p9 | 747782.jpg               | [freestocks.org — Pexels](https://www.pexels.com/photo/pink-bear-plush-toy-with-box-747782/)                           |
| توزيعة امتنان p10    | 7460112.jpg              | [Kristina Umaeva — Pexels](https://www.pexels.com/photo/a-gift-box-with-a-pink-ribbon-7460112/)                        |
| مبخرة دار p11        | incense-brass.jpg        | [Unsplash — لقطة بخور نحاسي](https://images.unsplash.com/photo-1612704057720-e8f66bade6ca)                             |
| بوكس هلال p12        | 10278973.jpg             | [Djordje Vezilic — Pexels](https://www.pexels.com/photo/a-gift-box-with-ribbon-10278973/)                              |
| الترحيب              | 9628007.jpg              | [Ivan S — Pexels](https://www.pexels.com/photo/a-person-holding-a-present-9628007/)                                    |
| التخصيص              | 5486842.jpg              | [Antoni Shkraba — Pexels](https://www.pexels.com/photo/a-person-cutting-a-ribbon-on-the-gift-5486842/)                 |

مصادر التراخيص: [Pexels](https://www.pexels.com/license/) و[Unsplash](https://unsplash.com/license). الاستخدام هنا للعرض المؤقت، ولا يعني تأييد المصور أو أي علامة تظهر في الصور لمتجر جيفت لاب. اعتمد صور المنتجات الحقيقية قبل أي إطلاق تجاري.

## تبديل الصور

1. ضع الصورة المعتمدة داخل `public/images/` باسم واضح.
2. عدّل `image.src` و`image.alt` في المنتج داخل `src/data.js`. لا تغيّر `id` كي تبقى عناصر السلة المحفوظة مرتبطة بمنتجاتها.
3. صورتا الترحيب والتخصيص في `homeImages.hero` و`homeImages.customization` داخل الملف نفسه؛ `ui.js` يربطهما بالواجهة.
4. الصور في البطاقات داخل إطار موحد بنسبة 1:1.1 وتستخدم contain، فلا تُقطع أطراف المنتج. الصور الأفقية قد تترك مساحة محايدة حولها.
5. شغّل الموقع وتحقق من ظهور الصور ومن صحة وصفها البديل. أداة QA الحالية تتحقق من 14 مسار صورة مختلفًا وتحميل الصور، وقد تحتاج تحديث عددها إذا أضيفت منتجات جديدة.

## الخط

Readex Pro من Google Fonts محفوظ محليًا في `public/fonts/` بأوزان 400 و500 و600. [ملف الرخصة الأصلي](https://raw.githubusercontent.com/google/fonts/main/ofl/readexpro/OFL.txt) محفوظ بجانب الخط باسم `OFL.txt`. يضبط `@font-face` في `src/styles.css` الخط دون أي طلب خارجي أثناء الاستخدام.

## تحديث الخطوط والمرجع البصري

أصبح الخط المستخدم IBM Plex Sans Arabic (400/500/600) للنصوص وNoto Naskh Arabic (400/500) للعناوين، محليًا داخل public/fonts. رخصتاهما في OFL-IBM-Plex-Sans-Arabic.txt وOFL-Noto-Naskh-Arabic.txt. مصدر الملفات Google Fonts، ومصدر الرخصتين [IBM Plex Sans Arabic](https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexsansarabic/OFL.txt) و[Noto Naskh Arabic](https://raw.githubusercontent.com/google/fonts/main/ofl/notonaskharabic/OFL.txt). ملفات Readex Pro السابقة محفوظة لكنها غير مستخدمة حاليًا.

لم تُغيّر الصور في متابعة البانر الكامل. حساب المحل https://www.tiktok.com/@glab_sa لم يكن متاحًا للقراءة الآلية؛ لا صور أو فيديوهات مأخوذة منه، والصور المؤقتة السابقة لا تمثل تنسيقاته المعتمدة.

آخر تحديث للخط: Alexandria محلي بأوزان 400 و500 و600، ورخصته في public/fonts/OFL-Alexandria.txt. مصدر الرخصة https://raw.githubusercontent.com/google/fonts/main/ofl/alexandria/OFL.txt. يحل محل الخطين السابقين في العرض الحالي. استُبدلت صورة p11 التي تضم شمعة بلقطة بخور حقيقية؛ صور العرض الأخرى لم تتغير.
