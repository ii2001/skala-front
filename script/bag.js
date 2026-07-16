(() => {
  "use strict";

  const myBag = [
    { name: "맥북", count: 1, unit: "대" },
    { name: "USB-C 충전기", count: 1, unit: "개" },
    { name: "무선 마우스", count: 1, unit: "개" },
    { name: "SKALA 학습 노트", count: 2, unit: "권" },
    { name: "검은색 펜", count: 3, unit: "자루" },
    { name: "텀블러", count: 1, unit: "개" }
  ];

  function showMyBag() {
    const resultElement = document.getElementById("bag-result");

    if (resultElement === null) {
      return;
    }

    const summary = document.createElement("p");
    const itemList = document.createElement("ul");
    let totalCount = 0;

    resultElement.textContent = "";

    for (let index = 0; index < myBag.length; index += 1) {
      const item = myBag[index];
      const listItem = document.createElement("li");

      listItem.textContent = `${item.name}: ${item.count}${item.unit}`;
      itemList.append(listItem);
      totalCount += item.count;
    }

    summary.textContent = `전체 물품 종류: ${myBag.length}종류 / 전체 수량: ${totalCount}`;
    resultElement.dataset.state = "success";
    resultElement.append(summary, itemList);
  }

  const showButton = document.getElementById("bag-show");

  if (showButton !== null) {
    showButton.addEventListener("click", showMyBag);
  }
})();
