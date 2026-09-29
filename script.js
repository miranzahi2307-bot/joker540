// ===============================
// 🃏 جوکر ۵۴۰
// مرحله: کارت‌ها + هم‌خال بازی کردن
// ===============================

const BASE = "./cards/";

// ---------- عناصر صفحه ----------
const playerHandEl = document.getElementById("playerHand");
const centerCardsEl = document.getElementById("centerCards");
const playerNameEl = document.getElementById("playerName");
const turnInfoEl = document.getElementById("turnInfo");

// اگر HTML هنوز آماده نباشد، کد متوقف می‌شود
if (!playerHandEl || !centerCardsEl) {
  console.error("❌ بخش کارت‌ها در HTML پیدا نشد.");
} else {

  // ---------- مشخصات کارت‌ها ----------

  const suits = [
    {
      id: "spades",
      symbol: "♠",
      order: 0
    },
    {
      id: "hearts",
      symbol: "♥",
      order: 1
    },
    {
      id: "diamonds",
      symbol: "♦",
      order: 2
    },
    {
      id: "clubs",
      symbol: "♣",
      order: 3
    }
  ];

  const ranks = [
    { id: "ace", name: "A", value: 14 },
    { id: "king", name: "K", value: 13 },
    { id: "queen", name: "Q", value: 12 },
    { id: "jack", name: "J", value: 11 },
    { id: "10", name: "10", value: 10 },
    { id: "9", name: "9", value: 9 },
    { id: "8", name: "8", value: 8 },
    { id: "7", name: "7", value: 7 },
    { id: "6", name: "6", value: 6 },
    { id: "5", name: "5", value: 5 },
    { id: "4", name: "4", value: 4 },
    { id: "3", name: "3", value: 3 },
    { id: "2", name: "2", value: 2 }
  ];

  // ---------- ساخت دسته کارت ----------

  let deck = [];

  suits.forEach(suit => {

    ranks.forEach(rank => {

      // طبق قانون جوکر ۵۴۰:
      // 2♣ و 2♦ حذف می‌شوند
      if (
        (suit.id === "clubs" && rank.id === "2") ||
        (suit.id === "diamonds" && rank.id === "2")
      ) {
        return;
      }

      deck.push({
        id: `${rank.id}_${suit.id}`,
        rank: rank.id,
        rankName: rank.name,
        rankValue: rank.value,
        suit: suit.id,
        suitSymbol: suit.symbol,
        isJoker: false,
        image: `${BASE}${rank.id}_of_${suit.id}.png`
      });

    });

  });

  // ---------- دو جوکر ----------

  deck.push({
    id: "joker_black",
    rank: "joker",
    rankName: "🃏",
    rankValue: 100,
    suit: "joker",
    suitSymbol: "🃏",
    isJoker: true,
    jokerColor: "black",
    image: `${BASE}black_joker.png`
  });

  deck.push({
    id: "joker_red",
    rank: "joker",
    rankName: "🃏",
    rankValue: 101,
    suit: "joker",
    suitSymbol: "🃏",
    isJoker: true,
    jokerColor: "red",
    image: `${BASE}red_joker.png`
  });


  // ---------- مخلوط کردن ----------

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] =
      [array[j], array[i]];
  }

  return array;
}

shuffle(deck);
  // ---------- پخش کارت‌ها ----------

let playerHand = deck.slice(0, 13);

const computerHands = [
  deck.slice(13, 26),
  deck.slice(26, 39),
  deck.slice(39, 52)
];

let playedCards = [];

let blackJokerPlayed = false;

let trickNumber = 1;

  function getComputerLegalCard(playerIndex) {

  const hand = computerHands[playerIndex - 1];

  if (!hand || hand.length === 0) {
    return null;
  }

  // -------------------------------
  // کارت‌های قانونی
  // -------------------------------

  const legalCards = hand.filter(card =>
    isCardLegal(card, hand)
  );

  if (legalCards.length === 0) {
    return null;
  }

  // -------------------------------
  // تشخیص تیم
  // -------------------------------

  const isSameTeam = (a, b) => {

    const teamA =
      a === 0 || a === 3 ? 0 : 1;

    const teamB =
      b === 0 || b === 3 ? 0 : 1;

    return teamA === teamB;
  };
// -------------------------------
// شروع دست
// -------------------------------

if (playedCards.length === 0) {

  // ⭐ قرارداد ویژه ۱۱، ۱۲ یا ۱۳
  // تیم مقابل باید با پیک شروع کند، اگر پیک داشته باشد

  if (specialContract !== null && trickNumber === 1) {

    // فقط کارت‌های معمولی؛ جوکر برای شروع ممنوع
    const normalStartCards = legalCards.filter(card =>
      !card.isJoker
    );

    if (normalStartCards.length > 0) {

      // اگر پیک دارد، حتماً پیک بازی کند
      const spades = normalStartCards.filter(card =>
        card.suit === "spades"
      );

      if (spades.length > 0) {

        // از بین پیک‌ها، طبق منطق فعلی ضعیف‌ترین را انتخاب کن
        spades.sort((a, b) =>
          a.rankValue - b.rankValue
        );

        return spades[0];
      }

      // اگر پیک ندارد، از خال‌های دیگر بازی کند
      const otherSuits = normalStartCards.filter(card =>
        card.suit !== "spades"
      );

      if (otherSuits.length > 0) {

        otherSuits.sort((a, b) =>
          a.rankValue - b.rankValue
        );

        return otherSuits[0];
      }

      return normalStartCards[0];
    }

    // اگر فقط جوکر دارد، فعلاً جوکر را برای شروع بازی نکن
    return null;
  }

  // -------------------------------
  // شروع عادی دست
  // -------------------------------

  const normalCards =
    legalCards.filter(card => !card.isJoker);

  if (normalCards.length > 0) {

    const suitInfo = {};

    normalCards.forEach(card => {

      if (!suitInfo[card.suit]) {
        suitInfo[card.suit] = {
          count: 0,
          strength: 0
        };
      }

      suitInfo[card.suit].count++;

      suitInfo[card.suit].strength +=
        card.rankValue;

      if (card.rank === "A") {
        suitInfo[card.suit].strength += 80;
      }

      if (card.rank === "K") {
        suitInfo[card.suit].strength += 40;
      }

      if (card.suit === "spades") {
        suitInfo[card.suit].strength += 5;
      }
    });

    let bestSuit = null;
    let bestScore = -Infinity;

    for (const suit in suitInfo) {

      const info = suitInfo[suit];

      let score =
        info.strength +
        info.count * 8;

      if (suit === "spades") {
        score += 20;
      }

      if (score > bestScore) {
        bestScore = score;
        bestSuit = suit;
      }
    }

    // 🛡️ اگر پیک کم داریم، برای شروع دست نگهش دار
    if (
      bestSuit === "spades" &&
      normalCards.filter(card =>
        card.suit === "spades"
      ).length <= 3
    ) {

      const otherSuits = Object.keys(suitInfo)
        .filter(suit => suit !== "spades");

      if (otherSuits.length > 0) {

        bestSuit = otherSuits.sort((a, b) =>
          suitInfo[b].strength -
          suitInfo[a].strength
        )[0];
      }
    }

    // 🛡️ اگر پیک‌ها زیاد ولی ضعیف هستند، با پیک شروع نکن
    if (bestSuit === "spades") {

      const spades = normalCards.filter(card =>
        card.suit === "spades"
      );

      const strongSpades = spades.filter(card =>
        ["A", "K", "Q", "J"].includes(card.rank)
      );

      const mediumSpades = spades.filter(card =>
        ["10", "9", "8", "7"].includes(card.rank)
      );

      const weakSpades = spades.filter(card =>
        ["6", "5", "4", "3", "2"].includes(card.rank)
      );

      const balancedSpades =
        strongSpades.length >= 2 ||
        (
          strongSpades.length >= 1 &&
          mediumSpades.length >= 2
        ) ||
        (
          strongSpades.length >= 2 &&
          weakSpades.length >= 2
        );

      if (
        spades.length >= 4 &&
        !balancedSpades
      ) {

        const otherSuits = Object.keys(suitInfo)
          .filter(suit => suit !== "spades");

        if (otherSuits.length > 0) {

          bestSuit = otherSuits.sort((a, b) =>
            suitInfo[b].strength -
            suitInfo[a].strength
          )[0];
        }
      }
    }

    const suitCards =
      normalCards.filter(card =>
        card.suit === bestSuit
      );

    const sortedStartCards =
      [...suitCards].sort(
        (a, b) =>
          a.rankValue - b.rankValue
      );

    // کارت‌های کوچک‌تر را برای شروع ترجیح بده
    const weakCards =
      sortedStartCards.filter(card =>
        card.rank !== "A" &&
        card.rank !== "K"
      );

    if (weakCards.length > 0) {
      return weakCards[0];
    }

    return sortedStartCards[0];
  }

  return legalCards[0];
}

  // -------------------------------
  // برنده فعلی دست
  // -------------------------------

  const currentWinner =
    getTrickWinner(playedCards);

  const partnerIsWinning =
    isSameTeam(playerIndex, currentWinner);

  // -------------------------------
  // کارت‌هایی که می‌توانند ببرند
  // -------------------------------

  const winningCards =
    legalCards.filter(card => {

      const testCard = {
        ...card,
        player: playerIndex
      };

      const testTrick = [
        ...playedCards,
        testCard
      ];

      return (
        getTrickWinner(testTrick) === playerIndex
      );
    });

  // -------------------------------
  // اگر یار در حال بردن است
  // -------------------------------

  if (partnerIsWinning) {

    const safeCards =
      legalCards.filter(card => {

        const testCard = {
          ...card,
          player: playerIndex
        };

        const testTrick = [
          ...playedCards,
          testCard
        ];

        return (
          getTrickWinner(testTrick) === currentWinner
        );
      });

    if (safeCards.length > 0) {

      const normalSafe =
        safeCards.filter(card =>
          !card.isJoker
        );

      if (normalSafe.length > 0) {

        const getSaveCost = (card) => {

          let cost = card.rankValue;

          if (card.rank === "A") {
            cost += 80;
          }
          else if (card.rank === "K") {
            cost += 50;
          }
          else if (card.rank === "Q") {
            cost += 30;
          }

          if (card.suit === "spades") {
            cost += 20;
          }

          return cost;
        };

        const candidates =
          [...normalSafe].sort(
            (a, b) =>
              getSaveCost(a) - getSaveCost(b)
          );

        return candidates[0];
      }

      return safeCards[0];
    }
  }

  // -------------------------------
  // اگر حریف برنده است و
  // می‌توانیم دست را ببریم
  // -------------------------------

  if (
    !partnerIsWinning &&
    winningCards.length > 0
  ) {

    const getWinCost = (card) => {

      if (card.isJoker) {
        return card.jokerColor === "red"
          ? 1000
          : 900;
      }

      let cost = card.rankValue;

      if (card.rank === "A") {
        cost += 80;
      }
      else if (card.rank === "K") {
        cost += 50;
      }
      else if (card.rank === "Q") {
        cost += 30;
      }

      if (card.suit === "spades") {
        cost += 20;
      }

      return cost;
    };

    const candidates =
      [...winningCards].sort(
        (a, b) =>
          getWinCost(a) - getWinCost(b)
      );

    return candidates[0];
  }

  // -------------------------------
  // اگر نمی‌توانیم ببریم
  // کارت کم‌ارزش را دور بریز
  // -------------------------------

  const normalCards =
    legalCards.filter(card =>
      !card.isJoker
    );

  if (normalCards.length > 0) {

    const ledSuit =
      getLedSuit();

    const ledSuitCards =
      ledSuit
        ? normalCards.filter(card =>
            card.suit === ledSuit
          )
        : [];

    if (ledSuitCards.length > 0) {

      ledSuitCards.sort(
        (a, b) =>
          a.rankValue - b.rankValue
      );

      return ledSuitCards[0];
    }

    // پیک را تا حد امکان حفظ کن
    const nonTrump =
      normalCards.filter(card =>
        card.suit !== "spades"
      );

    if (nonTrump.length > 0) {

      nonTrump.sort(
        (a, b) =>
          a.rankValue - b.rankValue
      );

      return nonTrump[0];
    }

    normalCards.sort(
      (a, b) =>
        a.rankValue - b.rankValue
    );

    return normalCards[0];
  }

  // -------------------------------
  // جوکر سیاه
  // -------------------------------

  const blackJoker =
    legalCards.find(card =>
      card.isJoker &&
      card.jokerColor === "black"
    );

  if (blackJoker) {

    if (trickNumber >= 10) {
      return blackJoker;
    }

    const testTrick = [
      ...playedCards,
      {
        ...blackJoker,
        player: playerIndex
      }
    ];

    if (
      getTrickWinner(testTrick) === playerIndex
    ) {
      return blackJoker;
    }
  }

  // -------------------------------
  // آخرین انتخاب
  // -------------------------------

  return legalCards[0];
  }
 
  function estimateComputerBid(hand) {

  let strength = 0;

  hand.forEach(card => {

    // جوکرها خیلی باارزش‌اند
    if (card.isJoker) {

      if (card.jokerColor === "red") {
        strength += 4;
      } else {
        strength += 3;
      }

      return;
    }

    // پیک حکم است
    if (card.suit === "spades") {

      if (card.rankValue >= 12) {
        strength += 2;
      } else if (card.rankValue >= 10) {
        strength += 1.5;
      } else {
        strength += 1;
      }

      return;
    }

    // کارت‌های خیلی قوی در خال‌های دیگر
    if (card.rankValue >= 13) {
      strength += 1.5;
    } else if (card.rankValue >= 12) {
      strength += 1;
    } else if (card.rankValue >= 11) {
      strength += 0.5;
    }
  });

  let bid = Math.floor(strength);

  // حداقل اعلام هر بازیکن
  if (bid < 2) {
    bid = 2;
  }

  // حداکثر اعلام
  if (bid > 13) {
    bid = 13;
  }

  return bid;
  }
  function getAllowedSecondBid(firstBid) {

  const minBid = 2;

  const maxBid = 13 - firstBid;

  if (maxBid < minBid) {
    return [];
  }

  const allowedBids = [];

  for (let bid = minBid; bid <= maxBid; bid++) {
    allowedBids.push(bid);
  }

  return allowedBids;
  }
  function chooseComputerBid(hand, firstBid = null) {

  const estimatedBid = calculateRealisticBid(hand);

  // اگر بازیکن اول تیم است
  if (firstBid === null) {

    return estimatedBid;
  }

  // اگر بازیکن دوم تیم است،
  // فقط عددهایی که مجموعشان با اعلام بازیکن اول
  // بیشتر از ۱۳ نشود مجاز هستند.
  const allowedBids =
    getAllowedSecondBid(firstBid);

  if (allowedBids.length === 0) {
    return null;
  }

  // نزدیک‌ترین اعلام مجاز به قدرت واقعی دست
  let bestBid = allowedBids[0];
  let smallestDifference =
    Math.abs(estimatedBid - bestBid);

  for (const bid of allowedBids) {

    const difference =
      Math.abs(estimatedBid - bid);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      bestBid = bid;
    }
  }

  return bestBid;
  }
  function getBiddingOrder(dealer) {

  // پخش‌کننده حسن
  if (dealer === 0) {
    return [1, 2, 3, 0];
  }

  // پخش‌کننده کامپیوتر ۱
  if (dealer === 1) {
    return [3, 0, 2, 1];
  }

  // پخش‌کننده کامپیوتر ۲
  if (dealer === 2) {
    return [0, 3, 1, 2];
  }

  // پخش‌کننده کامپیوتر ۳
  if (dealer === 3) {
    return [1, 2, 0, 3];
  }

  return [];
  }
  
function calculateRealisticBid(hand) {

  let bid = 0;

  // 🃏 جوکرها
  if (hand.some(card =>
    card.isJoker && card.jokerColor === "red"
  )) {
    bid += 1.5;
  }

  if (hand.some(card =>
    card.isJoker && card.jokerColor === "black"
  )) {
    bid += 1;
  }

  // ♠️ تعداد و قدرت پیک
  const spades = hand.filter(card =>
    !card.isJoker &&
    card.suit === "spades"
  );

  // تعداد پیک‌ها
  if (spades.length >= 5) {
    bid += 1;
  } else if (spades.length >= 4) {
    bid += 0.7;
  } else if (spades.length >= 3) {
    bid += 0.4;
  }

  // قدرت پیک‌ها
  spades.forEach(card => {

    if (card.rankValue === 14) {
      bid += 1.5;       // A♠
    }

    else if (card.rankValue === 13) {
      bid += 0.8;       // K♠
    }

    else if (card.rankValue === 12) {
      bid += 0.5;       // Q♠
    }

    else if (card.rankValue === 11) {
      bid += 0.3;       // J♠
    }
  });

  // 🂡 آس‌های خال‌های دیگر
  const otherAces = hand.filter(card =>
    !card.isJoker &&
    card.suit !== "spades" &&
    card.rankValue === 14
  );

  bid += otherAces.length * 0.7;

  // 👑 شاه‌های خال‌های دیگر
  const otherKings = hand.filter(card =>
    !card.isJoker &&
    card.suit !== "spades" &&
    card.rankValue === 13
  );

  bid += otherKings.length * 0.3;

  // 🔥 خال‌های کوتاه
  const suits = ["hearts", "diamonds", "clubs"];

  suits.forEach(suit => {

    const count = hand.filter(card =>
      !card.isJoker &&
      card.suit === suit
    ).length;

    // فقط وقتی واقعاً کوتاه باشد
    if (count === 0) {
      bid += 1;
    }

    else if (count === 1) {
      bid += 0.6;
    }

    else if (count === 2) {
      bid += 0.2;
    }
  });

  // تبدیل قدرت تقریبی به تعداد دست
  bid = Math.floor(bid);

  // حداقل اعلام
  if (bid < 2) {
    bid = 2;
  }

  // حداکثر اعلام
  if (bid > 13) {
    bid = 13;
  }

  return bid;
}
  function showRoundResult(
  hassanTeamBid,
  opponentTeamBid,
  hassanSuccess,
  opponentSuccess,
  hassanRoundScore,
  opponentRoundScore
) {

  const resultBox = document.createElement("div");

  resultBox.id = "roundResultBox";

  resultBox.style.position = "fixed";
  resultBox.style.left = "50%";
  resultBox.style.top = "50%";
  resultBox.style.transform = "translate(-50%, -50%)";
  resultBox.style.width = "90%";
  resultBox.style.maxWidth = "420px";
  resultBox.style.background = "rgba(0, 0, 0, 0.9)";
  resultBox.style.color = "white";
  resultBox.style.padding = "20px";
  resultBox.style.borderRadius = "20px";
  resultBox.style.textAlign = "center";
  resultBox.style.zIndex = "5000";
  resultBox.style.boxSizing = "border-box";

  // --------------------------------
// تعیین پخش‌کننده بر اساس تغییر تیم جلو
// --------------------------------

// --------------------------------
// تعیین پخش‌کننده بر اساس قانون جلو/عقب بودن تیم‌ها
// --------------------------------

    if (teamHassanScore === teamOpponentScore) {
  // مساوی → پخش‌کننده تغییر نمی‌کند
}
else if (dealer === 0) {
  // پخش‌کننده حسن
  if (teamHassanScore > teamOpponentScore) {
    dealer = 1;
  }
}
else if (dealer === 1) {
  // پخش‌کننده کامپیوتر ۱
  if (teamOpponentScore > teamHassanScore) {
    dealer = 3;
  }
}
else if (dealer === 3) {
  // پخش‌کننده کامپیوتر ۳
  if (teamHassanScore > teamOpponentScore) {
    dealer = 2;
  }
}
else if (dealer === 2) {
  // پخش‌کننده کامپیوتر ۲
  if (teamOpponentScore > teamHassanScore) {
    dealer = 0;
  }
}

console.log(
  "🎴 پخش‌کننده دور بعد:",
  players[dealer]
);

  resultBox.innerHTML = `
    <h2>🏁 نتیجه این دور</h2>

    <div style="margin:15px 0;">
      <h3>🟢 تیم حسن</h3>
      <p>
        اعلام: ${hassanTeamBid}
        <br>
        دست گرفته‌شده: ${teamHassanTricks}
        <br>
        ${hassanSuccess ? "✅ موفق" : "❌ شکست"}
        <br>
        امتیاز این دور:
        ${hassanSuccess ? "+" : "-"}${hassanRoundScore}
      </p>
    </div>

    <div style="margin:15px 0;">
      <h3>🔴 تیم مقابل</h3>
      <p>
        اعلام: ${opponentTeamBid}
        <br>
        دست گرفته‌شده: ${teamOpponentTricks}
        <br>
        ${opponentSuccess ? "✅ موفق" : "❌ شکست"}
        <br>
        امتیاز این دور:
        ${opponentSuccess ? "+" : "-"}${opponentRoundScore}
      </p>
    </div>

    <hr>

    <h3>🏆 امتیاز کل</h3>

    <p>
      🟢 تیم حسن: ${teamHassanScore}
      <br>
      🔴 تیم مقابل: ${teamOpponentScore}
    </p>

    <p>
      🎴 پخش‌کننده دور بعد:
      <br>
      <strong>${players[dealer]}</strong>
    </p>

    <button id="continueGameButton">
      ادامه بازی
    </button>
  `;

  document.body.appendChild(resultBox);

  // --------------------------------
  // دکمه ادامه بازی
  // --------------------------------

  const continueButton =
    document.getElementById("continueGameButton");

  continueButton.onclick = () => {

    resultBox.remove();

    console.log(
      "🎴 پخش‌کننده دور بعد:",
      players[dealer]
    );
    // ===============================
// پایان کامل بازی در ۵۴۰ امتیاز
// ===============================

if (teamHassanScore >= 540 && teamOpponentScore < 540) {

  showGameComplete(
    "🏆 تیم حسن به امتیاز پایان رسید و بازی را برد!"
  );

  return;
}

if (teamOpponentScore >= 540 && teamHassanScore < 540) {

  showGameComplete(
    "🏆 تیم مقابل به امتیاز پایان رسید و بازی را برد!"
  );

  return;
}

// هر دو تیم به امتیاز پایان رسیده‌اند
if (
  teamHassanScore >= 540 &&
  teamOpponentScore >= 540
) {

  // اگر مساوی باشند، یک راند عادی دیگر
  if (teamHassanScore === teamOpponentScore) {
    console.log(
      "⚖️ هر دو تیم مساوی‌اند؛ راند اضافه ادامه پیدا می‌کند."
    );
  }

  // اگر تیم حسن جلو باشد، برنده است
  else if (teamHassanScore > teamOpponentScore) {

    showGameComplete(
      "🏆 تیم حسن در راند اضافه برنده شد!"
    );

    return;
  }

  // اگر تیم مقابل جلو باشد، برنده است
  else {

    showGameComplete(
      "🏆 تیم مقابل در راند اضافه برنده شد!"
    );

    return;
  }
}

// اگر هر دو تیم به ۵۴۰ یا بیشتر رسیده باشند،
// بازی ادامه پیدا می‌کند و راند بعدی کاملاً عادی است.

    startNextRound();
  };
  }
  function startNextRound() {

  console.log("🔄 دور جدید شروع شد");

  // --------------------------------
  // ساخت دوباره دست‌ها
  // --------------------------------

  // اطلاعات صاحب قبلی کارت‌ها پاک شود
  deck.forEach(card => {
    delete card.player;
  });

  // دسته را دوباره مخلوط می‌کنیم
  shuffle(deck);

  // ۱۳ کارت برای حسن
  playerHand = deck.slice(0, 13);

  // ۱۳ کارت برای هر کامپیوتر
  computerHands[0] = deck.slice(13, 26);
  computerHands[1] = deck.slice(26, 39);
  computerHands[2] = deck.slice(39, 52);

  // --------------------------------
  // صفر کردن اطلاعات مخصوص این دور
  // --------------------------------

  teamHassanTricks = 0;
  teamOpponentTricks = 0;

  playedCards = [];

  trickNumber = 1;

  trickWinner = null;

  blackJokerPlayed = false;

  currentPlayer = firstPlayerAfterDealer[dealer];

  // پیشنهادهای دور قبلی
  computer1Bid = null;
  computer2Bid = null;
  computer3Bid = null;
  hassanBid = null;

  // --------------------------------
  // هنوز پیشنهادها تمام نشده
  // --------------------------------

  biddingFinished = false;

  // --------------------------------
  // پخش‌کننده جدید
  // --------------------------------

  biddingOrder = getBiddingOrder(dealer);

  console.log(
    "🎴 پخش‌کننده جدید:",
    players[dealer]
  );

  console.log(
    "🔄 ترتیب اعلام جدید:",
    biddingOrder
  );

  // --------------------------------
  // پاک کردن اعلام‌های دور قبلی
  // --------------------------------

  const oldBidPanel =
    document.getElementById("joker540BidPanel");

  if (oldBidPanel) {
    oldBidPanel.remove();
  }

  const oldBidBox =
    document.getElementById("hassanBidBox");

  if (oldBidBox) {
    oldBidBox.remove();
  }

  // --------------------------------
  // پاک کردن کارت‌های وسط
  // --------------------------------

  centerCardsEl.innerHTML = "";

  // --------------------------------
  // نمایش دست جدید حسن
  // --------------------------------

  renderHand();

  // کارت‌ها تا پایان اعلام‌ها قفل باشند
  playerHandEl.style.pointerEvents = "none";

  updateTurnInfo();

  // --------------------------------
  // شروع اعلام پیشنهادهای دور جدید
  // --------------------------------

  runBidding().then(() => {
  biddingFinished = true;
  updateTurnInfo();

  console.log("🃏 دور جدید آماده بازی است.");

  if (currentPlayer !== 0) {
    computerPlay();
  }
});
  }

// ---------- شروع تابع پایان دست ----------

function finishTrick() {
  if (playedCards.length !== 4) {
    return;
  }

  const trickCards = [...playedCards];

  console.log(
    `🃏 دست ${trickNumber}:`,
    trickCards.map(card =>
      card.isJoker
        ? `${players[card.player]} → 🃏 جوکر ${card.jokerColor === "black" ? "سیاه" : "قرمز"}`
        : `${players[card.player]} → ${card.rankName}${card.suitSymbol}`
    )
  );

  trickWinner = getTrickWinner(trickCards);

  console.log(
    "🏆 برنده دست:",
    players[trickWinner]
  );
  // --------------------------------
// ثبت برد تیم
// --------------------------------

if (trickWinner === 0 || trickWinner === 3) {
  teamHassanTricks++;
} else {
  teamOpponentTricks++;
}

console.log(
  "📊 امتیاز تیم‌ها:",
  `تیم حسن = ${teamHassanTricks}`,
  `تیم مقابل = ${teamOpponentTricks}`
);

  // --------------------------------
  // بررسی جوکر سیاه تا پایان دست ۱۱
  // --------------------------------

  if (
    trickNumber === 11 &&
    !blackJokerPlayed
  ) {

    let blackJokerOwner = null;

    // بررسی دست حسن
    if (
      playerHand.some(card =>
        card.isJoker &&
        card.jokerColor === "black"
      )
    ) {
      blackJokerOwner = 0;
    }

    // بررسی دست کامپیوترها
    for (let i = 0; i < computerHands.length; i++) {

      if (
        computerHands[i].some(card =>
          card.isJoker &&
          card.jokerColor === "black"
        )
      ) {
        blackJokerOwner = i + 1;
      }
    }

    if (blackJokerOwner !== null) {

      const blackJokerOwnerName =
  players[blackJokerOwner];

console.log(
  "🃏 دارنده جوکر سیاه:",
  blackJokerOwnerName
);

      const losingTeam =
        blackJokerOwner === 0 ||
        blackJokerOwner === 3
          ? "تیم حسن (حسن + کامپیوتر ۳)"
          : "تیم مقابل (کامپیوتر ۱ + کامپیوتر ۲)";

      console.log(
        "💀 جوکر سیاه تا پایان دست ۱۱ بازی نشد"
      );

      console.log(
        "❌ بازنده:",
        losingTeam
      );

      showGameComplete(
  `💀 جوکر سیاه سوخت — ${losingTeam} باخت\n🃏 دارنده جوکر سیاه: ${blackJokerOwnerName}`
);

playerHandEl.style.pointerEvents = "none";

playedCards = [];

clearTimeout(computerTimer);

setTimeout(() => {
  centerCardsEl.innerHTML = "";
}, 800);

return;
    }
  }

  // --------------------------------
  // برنده، شروع‌کننده دست بعدی است
  // --------------------------------

  currentPlayer = trickWinner;

  // دست فعلی تمام شد
  playedCards = [];

  // تایمر قبلی کامپیوتر را متوقف می‌کنیم
  clearTimeout(computerTimer);

  // --------------------------------
  // بررسی پایان بازی
  // --------------------------------

  const allCardsFinished =
    playerHand.length === 0 &&
    computerHands.every(hand => hand.length === 0);

  if (allCardsFinished) {
    if (specialContract !== null) {

  const specialTeamTricks =
    specialContractTeam === "hassan"
      ? teamHassanTricks
      : teamOpponentTricks;

  const specialTeamName =
    specialContractTeam === "hassan"
      ? "تیم حسن"
      : "تیم مقابل";

  if (specialTeamTricks >= specialContract) {

    showGameComplete(
      `🏆 ${specialTeamName} قرارداد ویژه ${specialContract} را با موفقیت انجام داد!`
    );

  } else {

    showGameComplete(
      `❌ ${specialTeamName} در قرارداد ویژه ${specialContract} شکست خورد!`
    );
  }

  playerHandEl.style.pointerEvents = "none";
  clearTimeout(computerTimer);

  return;
    }

  console.log("🏁 دور تمام شد");
    const hassanTeamBid = computer3Bid + hassanBid;
const opponentTeamBid = computer1Bid + computer2Bid;

  const hassanSuccess =
    teamHassanTricks >= hassanTeamBid;

  const opponentSuccess =
    teamOpponentTricks >= opponentTeamBid;
    // محاسبه امتیاز این دور
const hassanRoundScore = getContractScore(hassanTeamBid);
const opponentRoundScore = getContractScore(opponentTeamBid);

if (hassanSuccess) {
  teamHassanScore += hassanRoundScore;
} else {
  teamHassanScore -= hassanRoundScore;
}

if (opponentSuccess) {
  teamOpponentScore += opponentRoundScore;
} else {
  teamOpponentScore -= opponentRoundScore;
}

console.log(
  "🏆 امتیاز کل:",
  `تیم حسن = ${teamHassanScore}`,
  `تیم مقابل = ${teamOpponentScore}`
);

  console.log(
    "📋 نتیجه قراردادها:",
    `تیم حسن: ${teamHassanTricks}/${hassanTeamBid}`,
    hassanSuccess ? "✅ موفق" : "❌ شکست"
  );

  console.log(
    "📋 نتیجه قرارداد مقابل:",
    `تیم مقابل: ${teamOpponentTricks}/${opponentTeamBid}`,
    opponentSuccess ? "✅ موفق" : "❌ شکست"
  );

    showRoundResult(
  hassanTeamBid,
  opponentTeamBid,
  hassanSuccess,
  opponentSuccess,
  hassanRoundScore,
  opponentRoundScore
);

  return;
  }

  // --------------------------------
// بررسی غیرممکن شدن قرارداد ویژه
// --------------------------------

if (specialContract !== null) {

  const completedTricks =
    teamHassanTricks + teamOpponentTricks;

  const remainingTricks =
    13 - completedTricks;

  const specialTeamTricks =
    specialContractTeam === "hassan"
      ? teamHassanTricks
      : teamOpponentTricks;

  // اگر حتی با گرفتن تمام دست‌های باقی‌مانده
  // تیم قرارداد نتواند به عدد اعلام‌شده برسد
  if (
    specialTeamTricks + remainingTricks <
    specialContract
  ) {

    const specialTeamName =
      specialContractTeam === "hassan"
        ? "تیم حسن"
        : "تیم مقابل";

    showGameComplete(
      `❌ قرارداد ویژه ${specialContract} دیگر قابل دستیابی نیست — ${specialTeamName} باخت!`
    );

    playerHandEl.style.pointerEvents = "none";

    clearTimeout(computerTimer);

    setTimeout(() => {
      centerCardsEl.innerHTML = "";
    }, 800);

    return;
  }
}

  // --------------------------------
  // رفتن به دست بعد
  // --------------------------------

  trickNumber++;

  updateTurnInfo();

  setTimeout(() => {
  const cards = centerCardsEl.querySelectorAll(".center-card");

  cards.forEach(card => {
    card.style.transition =
      "left 0.5s ease, top 0.5s ease, transform 0.5s ease, opacity 0.5s ease";

    card.style.left = "50%";
    card.style.top = "50%";
    card.style.transform =
      "translate(-50%, -50%) scale(0.6)";
    card.style.opacity = "0";
  });

  setTimeout(() => {
    centerCardsEl.innerHTML = "";
  }, 500);

}, 450);

  // اگر نوبت حسن است
  if (currentPlayer === 0) {

    playerHandEl.style.pointerEvents = "auto";

    setTimeout(() => {
      updateLegalCards();
    }, 850);

    return;
  }

  // اگر نوبت یکی از کامپیوترهاست
  playerHandEl.style.pointerEvents = "none";

  computerTimer = setTimeout(
    computerPlay,
    900
  );
  }
  
  function computerPlay() {
    if (!biddingFinished) {
  return;
    }

  if (currentPlayer === 0) {
    return;
  }

  const card = getComputerLegalCard(currentPlayer);

  if (!card) {
    console.log(
      `⚠️ ${players[currentPlayer]} کارت قانونی پیدا نکرد`
    );
    return;
  }

  console.log(
    `🤖 ${players[currentPlayer]} کارت بازی کرد:`,
    card
  );
    if (card.isJoker) {
  console.log(
    `🃏 ${players[currentPlayer]} جوکر ${card.jokerColor === "black" ? "سیاه" : "قرمز"} بازی کرد`
  );
    }

  card.player = currentPlayer;

  computerHands[currentPlayer - 1] =
    computerHands[currentPlayer - 1].filter(
      c => c.id !== card.id
    );

  addCardToCenter(card);

playedCards.push(card);

if (card.isJoker && card.jokerColor === "black") {
  blackJokerPlayed = true;
}

  // اگر چهار کارت کامل شد،
  // پایان دست را یک‌جا مدیریت می‌کنیم.
  if (playedCards.length === 4) {
  setTimeout(() => {
    finishTrick();
  }, 1000);
  return;
  }

  // هنوز چهار کارت کامل نشده
  currentPlayer = nextPlayer[currentPlayer];

  updateTurnInfo();

  if (currentPlayer === 0) {
    playerHandEl.style.pointerEvents = "auto";
    updateLegalCards();
  } else {
    playerHandEl.style.pointerEvents = "none";

    clearTimeout(computerTimer);
    computerTimer = setTimeout(computerPlay, 900);
  }
  }
  // ---------- مرتب‌سازی ----------
  // ♠ → ♥ → ♦ → ♣ → 🃏
  // داخل هر خال:
  // A → K → Q → J → 10 → ... → 2
  
  function sortHand(hand) {

const suitOrder = {  
  spades: 0,  
  hearts: 1,  
  diamonds: 2,  
  clubs: 3,  
  joker: 4  
};  

return hand.sort((a, b) => {  

  // اول خال  
  const suitDifference =  
    suitOrder[a.suit] - suitOrder[b.suit];  

  if (suitDifference !== 0) {  
    return suitDifference;  
  }  

  // بعد قدرت کارت  
  return b.rankValue - a.rankValue;  
});

}

sortHand(playerHand);
sortHand(computerHands[0]);
sortHand(computerHands[1]);
sortHand(computerHands[2]);

// ---------- پیدا کردن خال کارت اول ----------

  // ---------- پیدا کردن خال کارت اول ----------

  function getLedSuit() {

    if (playedCards.length === 0) {
      return null;
    }

    const firstCard = playedCards[0];

    // اگر کارت اول جوکر باشد،
    // فعلاً خال معمولی تعیین نمی‌شود.
    if (firstCard.isJoker) {
      return null;
    }

    return firstCard.suit;
  }

  // ---------- آیا بازیکن خال بازی‌شده را دارد؟ ----------

  function playerHasLedSuit(hand) {

  const ledSuit = getLedSuit();

  if (!ledSuit) {
    return false;
  }

  return hand.some(card =>
    !card.isJoker &&
    card.suit === ledSuit
  );
  }

  // ---------- آیا کارت قانونی است؟ ----------

  function isCardLegal(card, hand) {

    // اگر هنوز کارتی بازی نشده،
    // همه کارت‌ها فعلاً مجاز هستند.
    if (playedCards.length === 0) {
      return true;
    }

    // جوکرها فعلاً استثنا هستند.
    if (card.isJoker) {
      return true;
    }

    const ledSuit = getLedSuit();

    // اگر کارت اول جوکر بوده
    if (!ledSuit) {
      return true;
    }

    // اگر بازیکن خال بازی‌شده را دارد،
    // باید همان خال را بازی کند.
    if (playerHasLedSuit(hand)) {
      return card.suit === ledSuit;
    }

    // اگر آن خال را ندارد، هر کارت دیگری مجاز است.
    return true;
  }

  // ---------- اعمال وضعیت قانونی کارت‌ها ----------
  function getCardStrength(card) {
  const strength = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "J": 11,
    "Q": 12,
    "K": 13,
    "A": 14
  };

  let value = strength[card.rank];

  // حکم همیشه پیک است
  if (card.suitSymbol === "♠") {
    value += 100;
  }

  return value;
  }
  function getTrickWinner(trickCards) {

  // --------------------------------
  // جوکر قرمز بعد از فعال شدن
  // --------------------------------

  if (blackJokerPlayed) {

    const redJoker = trickCards.find(card =>
      card.isJoker &&
      card.jokerColor === "red"
    );

    if (redJoker) {
      return redJoker.player;
    }
  }

  // --------------------------------
  // جوکر سیاه
  // --------------------------------

  const blackJoker = trickCards.find(card =>
    card.isJoker &&
    card.jokerColor === "black"
  );

  if (blackJoker) {
    return blackJoker.player;
  }

  // --------------------------------
  // فقط کارت‌های معمولی
  // --------------------------------

  const firstNormalCard = trickCards.find(card =>
    !card.isJoker
  );

  if (!firstNormalCard) {
    return trickCards[0].player;
  }

  const leadSuit = firstNormalCard.suit;

  let winner = null;

  for (const card of trickCards) {

    if (card.isJoker) {
      continue;
    }

    // کارت خارج از خال شروع
    // فقط اگر حکم باشد می‌تواند برنده شود
    if (
      card.suit !== leadSuit &&
      card.suit !== "spades"
    ) {
      continue;
    }

    if (!winner) {
      winner = card;
      continue;
    }

    // حکم پیک برنده‌ی هر خال معمولی است
    if (
      card.suit === "spades" &&
      winner.suit !== "spades"
    ) {
      winner = card;
      continue;
    }

    // اگر هر دو از یک خال هستند،
    // رتبه بالاتر برنده است
    if (
      card.suit === winner.suit &&
      card.rankValue > winner.rankValue
    ) {
      winner = card;
    }
  }

  return winner
    ? winner.player
    : trickCards[0].player;
  }

  function updateLegalCards() {

    const cards = playerHandEl.querySelectorAll(".card-image");

    cards.forEach(img => {

      const cardId = img.dataset.cardId;

      const card = playerHand.find(c =>
        c.id === cardId
      );

      if (!card) {
        return;
      }

      const legal = isCardLegal(card, playerHand);

      if (legal) {
  img.classList.remove("illegal-card");

  if (currentPlayer === 0) {
    img.style.pointerEvents = "auto";
  } else {
    img.style.pointerEvents = "none";
  }

} else {
        img.classList.add("illegal-card");
        img.style.pointerEvents = "none";
      }

    });
  }

  // ---------- نمایش کارت‌های دست ----------

  function renderHand() {

    // قبل از ساخت دوباره کارت‌ها،
    // فقط خود دست بازیکن پاک می‌شود.
    playerHandEl.innerHTML = "";

    sortHand(playerHand);

    playerHand.forEach((card, index) => {

      const img = document.createElement("img");

      img.className = "card-image";
      
      const count = playerHand.length;
const visualIndex = count - 1 - index;

// عرض واقعی صفحه
const screenWidth = window.innerWidth;

// عرض تقریبی هر کارت
const cardWidth = 60;

// فاصله‌ای که باعث می‌شود همه کارت‌ها داخل صفحه بمانند
const maxHandWidth = screenWidth - 20;

// فاصله بین کارت‌ها
const cardStep = count > 1
  ? Math.min(30, maxHandWidth / (count - 1))
  : 0;

const totalWidth = cardStep * (count - 1);

const offset =
  -totalWidth / 2 +
  visualIndex * cardStep;

const maxAngle = Math.min(24, (count - 1) * 3);
const angle = count > 1
  ? -maxAngle + visualIndex * (maxAngle * 2 / (count - 1))
  : 0;

img.style.left = `calc(50% + ${offset}px)`;
img.style.transform =
  `translateX(-50%) rotate(${angle}deg)`;

      img.src = card.image;
console.log("🖼️ مسیر کارت:", card.image);
img.onerror = () => console.log("❌ کارت پیدا نشد:", card.image);

      img.alt = `${card.rankName}${card.suitSymbol}`;

      // مهم:
      // شناسه واقعی کارت را روی خود عکس ذخیره می‌کنیم.
      // دیگر از index برای پیدا کردن کارت استفاده نمی‌کنیم.
      img.dataset.cardId = card.id;

      img.dataset.index = index;

      // کلیک فقط روی کارت قانونی
      img.addEventListener("click", () => {
        if (currentPlayer !== 0) {
  return;
        }

        const currentCard = playerHand.find(c =>
          c.id === img.dataset.cardId
        );

        if (!currentCard) {
          return;
        }

        // اگر کارت غیرقانونی بود، هیچ کاری نکن
        if (!isCardLegal(currentCard, playerHand)) {
          return;
        }

        playCard(currentCard, img);
      });

      playerHandEl.insertBefore(img, playerHandEl.firstChild);
    });

    // بعد از ساخت کارت‌ها،
    // وضعیت قانونی را اعمال می‌کنیم.
    updateLegalCards();
  }
  function showBidMessage(message) {

  let bidPanel =
    document.getElementById("joker540BidPanel");

  // ساخت کادر اصلی فقط یک بار
  if (!bidPanel) {

    bidPanel = document.createElement("div");

    bidPanel.id = "joker540BidPanel";

    bidPanel.style.display = "block";
    bidPanel.style.background = "rgba(0, 0, 0, 0.25)";
    bidPanel.style.borderRadius = "15px";
    bidPanel.style.padding = "12px 18px";
    bidPanel.style.margin = "12px auto";
    bidPanel.style.width = "85%";
    bidPanel.style.maxWidth = "420px";
    bidPanel.style.boxSizing = "border-box";
    bidPanel.style.textAlign = "center";
    bidPanel.style.boxShadow =
  "0 4px 12px rgba(0,0,0,0.2)";
    bidPanel.style.position = "fixed";
bidPanel.style.left = "50%";
bidPanel.style.top = "38%";
bidPanel.style.transform = "translate(-50%, -50%)";
bidPanel.style.zIndex = "20";

    const title =
      document.createElement("div");

    title.textContent =
      "📢 اعلام پیشنهادها";

    title.style.fontSize = "20px";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "8px";

    bidPanel.appendChild(title);

    turnInfoEl.parentNode.insertBefore(
      bidPanel,
      playerHandEl
    );
  }

  // اضافه کردن اعلام جدید داخل همان کادر
  const messageEl =
    document.createElement("div");

  messageEl.textContent = message;

  messageEl.style.fontSize = "17px";
  messageEl.style.fontWeight = "bold";
  messageEl.style.margin = "6px 0";

  bidPanel.appendChild(messageEl);
  }
  function showHassanBidOptions(allowedBids, onSelect) {

  console.log(
    "🎯 گزینه‌های پیشنهاد حسن:",
    allowedBids
  );

  const bidBox = document.createElement("div");

  bidBox.id = "hassanBidBox";

  bidBox.style.display = "flex";
  bidBox.style.justifyContent = "center";
  bidBox.style.gap = "5px";
  bidBox.style.margin = "15px 0";
  bidBox.style.flexWrap = "wrap";
    bidBox.style.position = "fixed";
bidBox.style.left = "50%";
bidBox.style.transform = "translateX(-50%)";
bidBox.style.width = "85%";
bidBox.style.maxWidth = "420px";
bidBox.style.zIndex = "21";

const bidPanel = document.getElementById("joker540BidPanel");

if (bidPanel) {
  const rect = bidPanel.getBoundingClientRect();
  bidBox.style.top = `${rect.bottom + 10}px`;
}

  allowedBids.forEach(bid => {

    const button = document.createElement("button");

    button.textContent = bid;

    button.style.padding = "8px 10px";
button.style.fontSize = "16px";
    button.style.cursor = "pointer";

    button.onclick = () => {

  console.log(
    "🤵 حسن انتخاب کرد:",
    bid
  );

  if (onSelect) {
    onSelect(bid);
  }

  bidBox.remove();

};

    bidBox.appendChild(button);
  });

  turnInfoEl.parentNode.insertBefore(
    bidBox,
    playerHandEl
  );
  }

  // ---------- بازی کردن کارت ----------
  const players = [
  "حسن",
  "کامپیوتر ۱",
  "کامپیوتر ۲",
  "کامپیوتر ۳"
];
  let dealer = 0;

console.log(
  "🎴 پخش‌کننده:",
  players[dealer]
);
  let biddingOrder = getBiddingOrder(dealer);

console.log(
  "🔄 ترتیب اعلام:",
  biddingOrder
);

let computer1Bid = null;
let computer2Bid = null;
let computer3Bid = null;
  let hassanBid = null;
  let specialContract = null;
let specialContractTeam = null;
  function waitForHassanBid(allowedBids) {

  return new Promise(resolve => {

    showHassanBidOptions(
      allowedBids,
      resolve
    );

  });

  }
  function getContractScore(bid) {

  const scores = {
    4: 40,
    5: 50,
    6: 60,
    7: 70,
    8: 160,
    9: 180,
    10: 200,
    11: 420,
    12: 440,
    13: 460
  };

  return scores[bid] || 0;
  }


  

let currentPlayer = 0;
  let biddingFinished = false;
  let trickWinner = null;
  let computerTimer = null;
  let teamHassanTricks = 0;
let teamOpponentTricks = 0;
  let teamHassanScore = 0;
let teamOpponentScore = 0;
  const nextPlayer = {
  0: 1, // حسن → کامپیوتر ۱
  1: 3, // کامپیوتر ۱ → کامپیوتر ۳
  3: 2, // کامپیوتر ۳ → کامپیوتر ۲
  2: 0  // کامپیوتر ۲ → حسن
};
  const nextDealer = {
  1: 3,
  3: 2,
  2: 0,
  0: 1
};
  const firstPlayerAfterDealer = {
  0: 1, // حسن → کامپیوتر ۱
  1: 3, // کامپیوتر ۱ → کامپیوتر ۳
  3: 2, // کامپیوتر ۳ → کامپیوتر ۲
  2: 0  // کامپیوتر ۲ → حسن
};
  function updateTurnInfo() {
    if (!biddingFinished) {
  playerHandEl.style.pointerEvents = "none";
  return;
    }

  if (currentPlayer === 0) {
    turnInfoEl.textContent = "🟢 نوبت شماست";
  } else {
    turnInfoEl.textContent =
      `🤖 نوبت ${players[currentPlayer]}`;
  }
    if (currentPlayer === 0) {
  playerHandEl.style.pointerEvents = "auto";
} else {
  playerHandEl.style.pointerEvents = "none";
    }

  }
  async function runBidding() {
    console.log("🚀 runBidding شروع شد");
    console.log("📋 biddingOrder داخل runBidding:", biddingOrder);

  for (const playerIndex of biddingOrder) {
    console.log("🔎 playerIndex:", playerIndex);

    if (playerIndex === 1) {
      computer1Bid = calculateRealisticBid(
        computerHands[0]
      );
      console.log("🤖 مقدار پیشنهاد کامپیوتر ۱:", computer1Bid);

    showBidMessage(
  `🤖 کامپیوتر ۱ اعلام کرد: ${computer1Bid}`
);
    }

    if (playerIndex === 2) {
      computer2Bid = chooseComputerBid(
        computerHands[1],
        computer1Bid
      );

      showBidMessage(
        `🤖 کامپیوتر ۲ اعلام کرد: ${computer2Bid}`
      );
    }

    if (playerIndex === 3) {
      computer3Bid = chooseComputerBid(
        computerHands[2]
      );

      showBidMessage(
        `🤖 کامپیوتر ۳ اعلام کرد: ${computer3Bid}`
      );
    }

    if (playerIndex === 0) {

      const allowedBids =
        getAllowedSecondBid(computer3Bid);

      showBidMessage(
        "🤵 حالا نوبت اعلام پیشنهاد حسن است"
      );

      hassanBid =
        await waitForHassanBid(allowedBids);

      showBidMessage(
  `🤵 حسن اعلام کرد: ${hassanBid}`
);
    }
  }

    const opponentTeamBid =
  computer1Bid + computer2Bid;

const hassanTeamBid =
  computer3Bid + hassanBid;

// قرارداد ویژه ۱۱، ۱۲، ۱۳
specialContract = null;
specialContractTeam = null;

if (
  opponentTeamBid >= 11 &&
  opponentTeamBid <= 13
) {
  specialContract = opponentTeamBid;
  specialContractTeam = "opponent";
}
else if (
  hassanTeamBid >= 11 &&
  hassanTeamBid <= 13
) {
  specialContract = hassanTeamBid;
  specialContractTeam = "hassan";
}

console.log(
  "⭐ قرارداد ویژه:",
  specialContract,
  specialContractTeam
);

showBidMessage(
  `📢 اعلام نهایی تیم مقابل: ${opponentTeamBid}`
);

showBidMessage(
  `📢 اعلام نهایی تیم حسن: ${hassanTeamBid}`
);

// ⏳ سه ثانیه مکث
await new Promise(resolve => setTimeout(resolve, 3000));
    
      // 🧹 پاک کردن همه اعلام‌ها و دکمه‌های پیشنهاد
  const bidPanel =
  document.getElementById("joker540BidPanel");

if (bidPanel) {
  bidPanel.remove();
}

  const bidBox = document.getElementById("hassanBidBox");

  if (bidBox) {
    bidBox.remove();
  }
  }



  function playCard(card, originalImage) {
    if (!biddingFinished) {
  return;
    }

  // جلوگیری از دوبار لمس کردن سریع
  if (
    !originalImage ||
    originalImage.dataset.playing === "true"
  ) {
    return;
  }

  originalImage.dataset.playing = "true";

  // کارت‌ها موقتاً غیرفعال
  playerHandEl.style.pointerEvents = "none";

  // موقعیت کارت
  const rect = originalImage.getBoundingClientRect();

  // کپی کارت برای انیمیشن
  const movingCard =
    originalImage.cloneNode(true);

  movingCard.className =
    "card-image card-playing";

  movingCard.style.position = "fixed";
  movingCard.style.left = `${rect.left}px`;
  movingCard.style.top = `${rect.top}px`;
  movingCard.style.width = `${rect.width}px`;
  movingCard.style.margin = "0";
  movingCard.style.pointerEvents = "none";
  movingCard.style.zIndex = "1000";
  movingCard.style.transform = "none";

  document.body.appendChild(movingCard);

  const targetX =
    window.innerWidth / 2 -
    rect.width / 2;

  const targetY =
    window.innerHeight / 2 -
    rect.height / 2;

  requestAnimationFrame(() => {

    movingCard.style.left =
      `${targetX}px`;

    movingCard.style.top =
      `${targetY}px`;

    movingCard.style.transform =
      "scale(1.05)";
  });

  setTimeout(() => {

    if (movingCard.parentNode) {
      movingCard.parentNode.removeChild(
        movingCard
      );
    }

    // کارت از دست حسن حذف شود
    playerHand = playerHand.filter(
      c => c.id !== card.id
    );

    // مشخص کردن صاحب کارت
    card.player = currentPlayer;

    // قرار دادن در مرکز
    addCardToCenter(card);

    // اضافه کردن به دست فعلی
    playedCards.push(card);
    if (card.isJoker && card.jokerColor === "black") {
  blackJokerPlayed = true;
    }

    // نمایش دوباره دست حسن
    renderHand();

    // اگر چهار کارت کامل شده،
    // همین‌جا پایان دست را مدیریت می‌کنیم.
    if (playedCards.length === 4) {

      finishTrick();

      return;
    }

    // هنوز دست تمام نشده
    currentPlayer = nextPlayer[currentPlayer];

    updateTurnInfo();

    if (currentPlayer === 0) {

      playerHandEl.style.pointerEvents =
        "auto";

      updateLegalCards();

    } else {

      playerHandEl.style.pointerEvents =
        "none";

      clearTimeout(computerTimer);

      computerTimer =
        setTimeout(computerPlay, 700);
    }

  }, 380);
  }


// ===============================
// قرار دادن کارت در مرکز
// ===============================

function addCardToCenter(card) {

  if (!centerCardsEl) {
    return;
  }

  const img = document.createElement("img");

  img.className = "center-card";
  img.src = card.image;
  img.alt = `${card.rankName}${card.suitSymbol}`;

  img.dataset.cardId = card.id;
  img.dataset.player = card.player;

  img.style.position = "absolute";
  img.style.transform = "translate(-50%, -50%)";

  if (card.player === 0) {
    // حسن — پایین
    img.style.left = "50%";
    img.style.top = "75%";
  }

  else if (card.player === 1) {
  // کامپیوتر ۱ — راست
  img.style.left = "75%";
  img.style.top = "50%";
}

else if (card.player === 2) {
  // کامپیوتر ۲ — چپ
  img.style.left = "25%";
  img.style.top = "50%";
}

  else if (card.player === 3) {
    // کامپیوتر ۳ — بالا
    img.style.left = "50%";
    img.style.top = "25%";
  }

  centerCardsEl.appendChild(img);
}
  function showGameComplete(reason) {
  const screen = document.getElementById("gameCompleteScreen");
  const reasonEl = document.getElementById("gameCompleteReason");
  const scoresEl = document.getElementById("finalScores");
  const newGameButton = document.getElementById("newGameButton");

  if (!screen) return;

  reasonEl.textContent = reason;

  scoresEl.innerHTML = `
    <div>🔵 تیم حسن: ${teamHassanScore}</div>
    <div>🔴 تیم مقابل: ${teamOpponentScore}</div>
  `;

  screen.style.display = "flex";

  // دکمه بازی جدید
  if (newGameButton) {
    newGameButton.onclick = () => {
      location.reload();
    };
  }
  }


// ===============================
// نام بازیکن
// ===============================

if (playerNameEl) {
  playerNameEl.textContent = "حسن";
}


// ===============================
// شروع بازی
// ===============================

  teamHassanTricks = 0;
teamOpponentTricks = 0;

  console.log("🃏 کامپیوتر ۱:", computerHands[0].map(card => card.rankName + card.suitSymbol));

console.log("🃏 کامپیوتر ۲:", computerHands[1].map(card => card.rankName + card.suitSymbol));

console.log("🃏 کامپیوتر ۳:", computerHands[2].map(card => card.rankName + card.suitSymbol));
  
renderHand();
updateTurnInfo();

// 🚫 تا قبل از اعلام پیشنهاد، کارت‌ها قابل لمس نیستند
playerHandEl.style.pointerEvents = "none";

runBidding().then(() => {

  // ✅ بعد از انتخاب پیشنهاد، بازی آزاد می‌شود
  biddingFinished = true;

  if (specialContract !== null) {
  // قرارداد ۱۱، ۱۲ یا ۱۳ → تیم مقابل شروع می‌کند
  currentPlayer = 1;
} else {
  currentPlayer = firstPlayerAfterDealer[dealer];
  }

  updateTurnInfo();

if (currentPlayer !== 0) {
  computerPlay();
}

  console.log("🃏 جوکر ۵۴۰ آماده است.");
});

console.log("🃏 جوکر ۵۴۰ آماده است.");
console.log("تعداد کارت‌های دسته:", deck.length);
console.log("تعداد کارت‌های بازیکن:", playerHand.length);

}
