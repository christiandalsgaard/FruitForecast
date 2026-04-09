// Comprehensive produce database
// peak = best months (0-indexed), shoulder = acceptable months
export const PRODUCE_DB = [
  // ═══════════════════════════════════════
  // FRUITS
  // ═══════════════════════════════════════
  { id: "strawberries", name: "Strawberries", emoji: "🍓", type: "fruit", peak: [4, 5], shoulder: [3, 6], desc: "Sweet, juicy berries", tips: "Look for bright red color with no white shoulders. Smell them — fragrant berries taste best." },
  { id: "blueberries", name: "Blueberries", emoji: "🫐", type: "fruit", peak: [5, 6, 7], shoulder: [4, 8], desc: "Antioxidant-rich gems", tips: "A dusty silver-blue coating (bloom) means they're fresh. Shake the container — they should move freely." },
  { id: "raspberries", name: "Raspberries", emoji: "🫐", type: "fruit", peak: [5, 6, 7], shoulder: [8], desc: "Delicate summer berries", tips: "Check the bottom of the container for staining or mold. Use within 1-2 days of purchase." },
  { id: "cherries", name: "Cherries", emoji: "🍒", type: "fruit", peak: [5, 6], shoulder: [4, 7], desc: "Stone fruit classic", tips: "Choose firm, glossy cherries with green stems. Darker color usually means sweeter flavor." },
  { id: "peaches", name: "Peaches", emoji: "🍑", type: "fruit", peak: [6, 7], shoulder: [5, 8], desc: "Fuzzy summer sweetness", tips: "Smell the stem end — ripe peaches are very fragrant. They should give slightly when pressed." },
  { id: "watermelon", name: "Watermelon", emoji: "🍉", type: "fruit", peak: [6, 7, 8], shoulder: [5, 9], desc: "Ultimate summer refresher", tips: "Look for a yellow field spot and feel for heaviness. A hollow sound when tapped means it's ripe." },
  { id: "cantaloupe", name: "Cantaloupe", emoji: "🍈", type: "fruit", peak: [6, 7, 8], shoulder: [5, 9], desc: "Sweet melon delight", tips: "Press the stem end — it should give slightly and smell sweet. Avoid any with soft spots." },
  { id: "apples", name: "Apples", emoji: "🍎", type: "fruit", peak: [8, 9, 10], shoulder: [7, 11], desc: "Crisp autumn harvest", tips: "Firm with no bruising. Store in the fridge — they last weeks longer than on the counter." },
  { id: "pears", name: "Pears", emoji: "🍐", type: "fruit", peak: [8, 9, 10], shoulder: [7, 11], desc: "Buttery fall fruit", tips: "Buy firm and ripen at home. Check the neck — when it gives to gentle pressure, it's ready." },
  { id: "grapes", name: "Grapes", emoji: "🍇", type: "fruit", peak: [7, 8, 9], shoulder: [6, 10], desc: "Vine-ripened clusters", tips: "Stems should be green and flexible. A powdery bloom on the skin is a sign of freshness." },
  { id: "oranges", name: "Oranges", emoji: "🍊", type: "fruit", peak: [11, 0, 1, 2], shoulder: [10, 3], desc: "Winter citrus sunshine", tips: "Heavy for their size means more juice. Skin color doesn't indicate ripeness — even green ones can be ripe." },
  { id: "grapefruits", name: "Grapefruits", emoji: "🍊", type: "fruit", peak: [11, 0, 1, 2], shoulder: [10, 3], desc: "Tart citrus wake-up", tips: "Choose heavy, slightly flattened fruit. Pink and red varieties tend to be sweeter than white." },
  { id: "lemons", name: "Lemons", emoji: "🍋", type: "fruit", peak: [11, 0, 1, 2, 3], shoulder: [4, 10], desc: "Bright and zesty", tips: "Thin-skinned lemons yield more juice. Roll on the counter before cutting to release more juice." },
  { id: "limes", name: "Limes", emoji: "🍋", type: "fruit", peak: [4, 5, 6, 7, 8], shoulder: [3, 9], desc: "Tropical tang", tips: "Slightly yellow limes are actually riper and juicier than bright green ones." },
  { id: "mangoes", name: "Mangoes", emoji: "🥭", type: "fruit", peak: [4, 5, 6, 7], shoulder: [3, 8], desc: "Tropical luxury", tips: "Squeeze gently — ripe mangoes give slightly. Smell the stem end for a sweet, fruity aroma." },
  { id: "pineapple", name: "Pineapple", emoji: "🍍", type: "fruit", peak: [2, 3, 4, 5], shoulder: [1, 6], desc: "Tropical sweetness", tips: "Pluck a center leaf — if it comes out easily, it's ripe. Should smell sweet at the base." },
  { id: "bananas", name: "Bananas", emoji: "🍌", type: "fruit", peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], desc: "Year-round staple", tips: "Buy green and let them ripen. Brown spots mean more sugar. Separate them to slow ripening." },
  { id: "avocados", name: "Avocados", emoji: "🥑", type: "fruit", peak: [2, 3, 4, 5, 6, 7, 8], shoulder: [1, 9], desc: "Creamy perfection", tips: "Flick the stem nub — green underneath means ripe. Store unripe ones in a paper bag with a banana." },
  { id: "plums", name: "Plums", emoji: "🫐", type: "fruit", peak: [6, 7, 8], shoulder: [5, 9], desc: "Sweet stone fruit", tips: "Slight give when pressed means ripe. A whitish bloom on the skin is natural and indicates freshness." },
  { id: "pomegranates", name: "Pomegranates", emoji: "🫐", type: "fruit", peak: [9, 10, 11], shoulder: [8, 0], desc: "Jeweled winter fruit", tips: "Heavier is better — it means more juice. Scratch the skin; deep red underneath means ripe seeds." },
  { id: "cranberries", name: "Cranberries", emoji: "🫐", type: "fruit", peak: [9, 10, 11], shoulder: [8], desc: "Tart holiday staple", tips: "Fresh cranberries should bounce when dropped. Freeze extras — they last months in the freezer." },
  { id: "figs", name: "Figs", emoji: "🫐", type: "fruit", peak: [7, 8, 9], shoulder: [6, 10], desc: "Honey-sweet delicacy", tips: "Ripe figs are soft and may have slight cracks. Use within 1-2 days — they're extremely perishable." },
  { id: "persimmons", name: "Persimmons", emoji: "🍊", type: "fruit", peak: [9, 10, 11], shoulder: [8], desc: "Autumn jewel", tips: "Fuyu can be eaten firm; Hachiya must be very soft. Both should have glossy, unbroken skin." },

  // ═══════════════════════════════════════
  // VEGETABLES
  // ═══════════════════════════════════════
  { id: "asparagus", name: "Asparagus", emoji: "🥦", type: "vegetable", peak: [2, 3, 4], shoulder: [1, 5], desc: "Spring herald", tips: "Look for firm, straight spears with tight tips. Thicker spears are just as tender as thin ones." },
  { id: "artichokes", name: "Artichokes", emoji: "🥦", type: "vegetable", peak: [2, 3, 4], shoulder: [9, 10], desc: "Thistle treasure", tips: "Squeeze them — fresh artichokes squeak. Heavy for size with tight leaves is ideal." },
  { id: "peas", name: "Peas", emoji: "🫛", type: "vegetable", peak: [3, 4, 5], shoulder: [2, 6], desc: "Sweet spring pods", tips: "Bright green, plump pods that snap crisply. Eat quickly — sugar converts to starch after picking." },
  { id: "spinach", name: "Spinach", emoji: "🥬", type: "vegetable", peak: [2, 3, 4, 9, 10], shoulder: [1, 5, 8, 11], desc: "Leafy green power", tips: "Deep green with no yellowing or sliminess. Baby spinach is more tender; mature is better for cooking." },
  { id: "lettuce", name: "Lettuce", emoji: "🥬", type: "vegetable", peak: [3, 4, 5, 9, 10], shoulder: [2, 6, 8, 11], desc: "Salad essential", tips: "Crisp leaves with no browning on edges. Store with a damp paper towel in a sealed bag." },
  { id: "radishes", name: "Radishes", emoji: "🥬", type: "vegetable", peak: [3, 4, 5], shoulder: [2, 6, 9, 10], desc: "Peppery crunch", tips: "Firm with bright color and fresh greens attached. Smaller radishes tend to be less spicy." },
  { id: "tomatoes", name: "Tomatoes", emoji: "🍅", type: "vegetable", peak: [6, 7, 8], shoulder: [5, 9], desc: "Summer garden star", tips: "Never refrigerate — cold kills flavor. Vine-ripe and local will always outshine shipped tomatoes." },
  { id: "corn", name: "Corn", emoji: "🌽", type: "vegetable", peak: [6, 7, 8], shoulder: [5, 9], desc: "Sweet summer ears", tips: "Feel through the husk for plump, even rows. Fresh silk should be slightly sticky and golden." },
  { id: "zucchini", name: "Zucchini", emoji: "🥒", type: "vegetable", peak: [5, 6, 7, 8], shoulder: [4, 9], desc: "Prolific summer squash", tips: "Smaller is better — 6-8 inches has the best flavor and texture. Skin should be glossy." },
  { id: "cucumbers", name: "Cucumbers", emoji: "🥒", type: "vegetable", peak: [5, 6, 7, 8], shoulder: [4, 9], desc: "Cool and crisp", tips: "Firm all over with no soft spots. Unwaxed English cucumbers have better flavor." },
  { id: "bell_peppers", name: "Bell Peppers", emoji: "🫑", type: "vegetable", peak: [6, 7, 8, 9], shoulder: [5, 10], desc: "Colorful crunch", tips: "Red, orange, and yellow are just ripe green peppers — sweeter with more vitamins. Choose firm and heavy." },
  { id: "eggplant", name: "Eggplant", emoji: "🍆", type: "vegetable", peak: [6, 7, 8, 9], shoulder: [5, 10], desc: "Purple perfection", tips: "Press the skin — it should bounce back. Lighter weight means fewer seeds and less bitterness." },
  { id: "green_beans", name: "Green Beans", emoji: "🫛", type: "vegetable", peak: [5, 6, 7, 8], shoulder: [4, 9], desc: "Snappy summer pods", tips: "They should snap cleanly when bent. Avoid any with visible seeds bulging through the pod." },
  { id: "broccoli", name: "Broccoli", emoji: "🥦", type: "vegetable", peak: [9, 10, 11, 2, 3], shoulder: [1, 4, 8], desc: "Cruciferous champion", tips: "Tight, dark green florets with firm stems. Yellowing means it's past prime. Stems are edible — peel and slice them." },
  { id: "cauliflower", name: "Cauliflower", emoji: "🥦", type: "vegetable", peak: [9, 10, 11], shoulder: [8, 0, 1], desc: "Versatile florets", tips: "Creamy white with no brown spots. Leaves should look fresh. Heavy for its size is a good sign." },
  { id: "brussels_sprouts", name: "Brussels Sprouts", emoji: "🥦", type: "vegetable", peak: [9, 10, 11], shoulder: [8, 0], desc: "Mini cabbage gems", tips: "Small and bright green are sweetest. After a frost they're even sweeter. Cut an X in the base for even cooking." },
  { id: "kale", name: "Kale", emoji: "🥬", type: "vegetable", peak: [9, 10, 11, 0, 1], shoulder: [2, 8], desc: "Hearty winter green", tips: "Smaller leaves are more tender. Frost-kissed kale is sweeter. Massage raw kale with oil to tenderize." },
  { id: "sweet_potatoes", name: "Sweet Potatoes", emoji: "🍠", type: "vegetable", peak: [9, 10, 11], shoulder: [8, 0, 1], desc: "Orange comfort food", tips: "Firm with no cracks, soft spots, or sprouting. Store in a cool dark place — never refrigerate." },
  { id: "butternut_squash", name: "Butternut Squash", emoji: "🎃", type: "vegetable", peak: [9, 10, 11], shoulder: [8, 0, 1], desc: "Autumn warmth", tips: "Hard rind with a matte finish and solid stem. Heavy for its size. More beige = more ripe and sweet." },
  { id: "pumpkin", name: "Pumpkin", emoji: "🎃", type: "vegetable", peak: [9, 10], shoulder: [8, 11], desc: "Fall icon", tips: "Sugar pumpkins (small) are for eating; jack-o-lantern types are watery. Firm with no soft spots." },
  { id: "carrots", name: "Carrots", emoji: "🥕", type: "vegetable", peak: [8, 9, 10, 11, 0, 1, 2], shoulder: [3, 7], desc: "Sweet root staple", tips: "Firm with bright color. If greens are attached and look fresh, the carrots are very fresh. Remove greens for storage." },
  { id: "beets", name: "Beets", emoji: "🥬", type: "vegetable", peak: [5, 6, 7, 8, 9, 10], shoulder: [4, 11], desc: "Earthy ruby roots", tips: "Firm with smooth skin. Small to medium beets are more tender. Fresh greens attached are a bonus — cook those too." },
  { id: "turnips", name: "Turnips", emoji: "🥬", type: "vegetable", peak: [9, 10, 11], shoulder: [0, 1, 2], desc: "Earthy winter root", tips: "Small turnips are sweeter and more tender. Should feel heavy and firm with no soft spots." },
  { id: "parsnips", name: "Parsnips", emoji: "🥕", type: "vegetable", peak: [10, 11, 0, 1, 2], shoulder: [3, 9], desc: "Sweet winter root", tips: "Small to medium are best — large ones can have woody cores. Frost makes them sweeter." },
  { id: "celery", name: "Celery", emoji: "🥬", type: "vegetable", peak: [8, 9, 10, 11], shoulder: [0, 1, 7], desc: "Crisp and clean", tips: "Tight, compact bunches that snap cleanly. Darker outer stalks have more flavor; inner stalks are more tender." },
  { id: "cabbage", name: "Cabbage", emoji: "🥬", type: "vegetable", peak: [9, 10, 11, 0, 1, 2], shoulder: [3, 8], desc: "Winter workhorse", tips: "Heavy and firm with tight leaves. A whole head keeps for weeks in the fridge." },
  { id: "onions", name: "Onions", emoji: "🧅", type: "vegetable", peak: [3, 4, 5, 6, 7, 8], shoulder: [2, 9], desc: "Flavor foundation", tips: "Dry papery skin with no soft spots or sprouting. Sweet onions are best for eating raw." },
  { id: "garlic", name: "Garlic", emoji: "🧄", type: "vegetable", peak: [6, 7, 8], shoulder: [5, 9], desc: "Aromatic essential", tips: "Firm and plump with tight skin. Avoid any with green sprouts — they'll taste bitter." },
  { id: "mushrooms", name: "Mushrooms", emoji: "🍄", type: "vegetable", peak: [8, 9, 10, 11], shoulder: [0, 1, 7], desc: "Earthy umami", tips: "Firm and dry with no sliminess. Closed caps mean milder flavor; open caps are more intense." },
  { id: "potatoes", name: "Potatoes", emoji: "🥔", type: "vegetable", peak: [8, 9, 10], shoulder: [7, 11, 0], desc: "Versatile classic", tips: "Firm with no green spots or sprouting (green = solanine, which is toxic). Store in cool dark place, never with onions." },
];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
