/* =========================================
   DRESSES
========================================= */

const dresses = [
    {
        name: "Seraphina Gown",
        price: 500
    },

    {
        name: "Celine Dress",
        price: 700
    },

    {
        name: "Aurora Gown",
        price: 500
    },

    {
        name: "Isla Dress",
        price: 800
    }
];


let favorites =
    JSON.parse(localStorage.getItem("elanFavorites")) || [];


let bag =
    JSON.parse(localStorage.getItem("elanBag")) || [];


let discountClaimed =
    localStorage.getItem("elanDiscount") === "true";



/* Favorites are managed by catalog.js and favorites.html. */

/* =========================================
   BAG ICON
========================================= */

document
    .getElementById("bagIcon")
    .addEventListener("click", function () {

        if (bag.length === 0) {

            alert(
                "Your rental bag is empty.\n\nClick a dress to add one."
            );

            return;

        }


        let total = 0;

        let message =
            "YOUR RENTAL BAG\n\n";


        bag.forEach(
            function (dress, index) {

                total += dress.price;


                message +=
                    (index + 1) +
                    ". " +
                    dress.name +
                    " - ₱" +
                    dress.price +
                    "\n";

            }
        );


        message +=
            "\nSubtotal: ₱" +
            total;


        if (discountClaimed) {

            const discount =
                total * 0.15;


            const discountedTotal =
                total - discount;


            message +=
                "\n15% Discount: -₱" +
                discount.toFixed(2);


            message +=
                "\nTotal: ₱" +
                discountedTotal.toFixed(2);

        }


        alert(message);

    });



/* =========================================
   DRESS CARDS
========================================= */

document
    .querySelectorAll(".dress-card")
    .forEach(function (card) {

        card.addEventListener(
            "click",
            function () {

                const name =
                    card.dataset.name;


                const price =
                    Number(
                        card.dataset.price
                    );


                const choice =
                    prompt(
                        name +
                        "\n₱" +
                        price +
                        " / 4 days\n\n" +
                        "Type:\n" +
                        "1 - Add to Favorites\n" +
                        "2 - Add to Rental Bag\n" +
                        "3 - Add to Both"
                    );


                if (choice === "1") {

                    addFavorite(
                        name,
                        price
                    );

                }


                else if (choice === "2") {

                    addBag(
                        name,
                        price
                    );

                }


                else if (choice === "3") {

                    addFavorite(
                        name,
                        price,
                        false
                    );


                    addBag(
                        name,
                        price,
                        false
                    );


                    alert(
                        name +
                        " was added to your Favorites and Rental Bag."
                    );

                }

            }
        );

    });



/* =========================================
   ADD FAVORITE
========================================= */

function addFavorite(
    name,
    price,
    showMessage = true
) {

    const exists =
        favorites.some(
            dress =>
                dress.name === name
        );


    if (exists) {

        if (showMessage) {

            alert(
                name +
                " is already in your favorites."
            );

        }

        return;

    }


    favorites.push({
        name: name,
        price: price
    });


    localStorage.setItem(
        "elanFavorites",
        JSON.stringify(favorites)
    );


    if (showMessage) {

        alert(
            name +
            " was added to your favorites."
        );

    }

}



/* =========================================
   ADD TO BAG
========================================= */

function addBag(
    name,
    price,
    showMessage = true
) {

    const exists =
        bag.some(
            dress =>
                dress.name === name
        );


    if (exists) {

        if (showMessage) {

            alert(
                name +
                " is already in your rental bag."
            );

        }

        return;

    }


    bag.push({
        name: name,
        price: price
    });


    localStorage.setItem(
        "elanBag",
        JSON.stringify(bag)
    );


    if (showMessage) {

        alert(
            name +
            " was added to your rental bag."
        );

    }

}



/* =========================================
   CLAIM DISCOUNT
========================================= */

document
    .getElementById("discountButton")
    .addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            if (discountClaimed) {

                alert(
                    "Your 15% first-rental discount is already active."
                );

                return;

            }


            discountClaimed = true;


            localStorage.setItem(
                "elanDiscount",
                "true"
            );


            alert(
                "15% OFF activated!\n\nYour discount will be applied to the total in your rental bag."
            );

        }
    );



/* =========================================
   VIEW ALL
========================================= */

document
    .getElementById("viewAllButton")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById("dresses")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );



/* =========================================
   VIDEO
========================================= */

const playButton =
    document.getElementById(
        "playButton"
    );


const video =
    document.getElementById(
        "elanVideo"
    );


const videoThumbnail =
    document.getElementById(
        "videoThumbnail"
    );


const videoOverlay =
    document.getElementById(
        "videoOverlay"
    );


function playVideo() {

    videoThumbnail.style.display =
        "none";


    videoOverlay.style.display =
        "none";


    video.style.display =
        "block";


    video.play();

}


playButton.addEventListener(
    "click",
    playVideo
);


document
    .getElementById("storyLink")
    .addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            document
                .getElementById("story")
                .scrollIntoView({
                    behavior: "smooth"
                });


            setTimeout(
                playVideo,
                500
            );

        }
    );



/* =========================================
   ABOUT
========================================= */

function showAbout(event) {

    event.preventDefault();


    alert(
        "ABOUT ÉLAN\n\n" +
        "ÉLAN is a designer dress rental service created for special moments without the long-term commitment."
    );

}


document
    .getElementById("aboutLink")
    .addEventListener(
        "click",
        showAbout
    );


document
    .querySelectorAll(".aboutButton")
    .forEach(
        button =>
            button.addEventListener(
                "click",
                showAbout
            )
    );



/* =========================================
   MEMBERSHIP
========================================= */

function showMembership(event) {

    event.preventDefault();


    alert(
        "ÉLAN MEMBERSHIP\n\n" +
        "Membership details will include exclusive rental offers, benefits, and special access for ÉLAN members."
    );

}


document
    .getElementById("membershipLink")
    .addEventListener(
        "click",
        showMembership
    );


document
    .querySelectorAll(".membershipButton")
    .forEach(
        button =>
            button.addEventListener(
                "click",
                showMembership
            )
    );



/* =========================================
   HOW IT WORKS
========================================= */

document
    .getElementById("howItWorksLink")
    .addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            alert(
                "HOW IT WORKS\n\n" +
                "1. Choose your dress.\n" +
                "2. Add it to your rental bag.\n" +
                "3. Rent it for 4 days.\n" +
                "4. Wear it for your special moment.\n" +
                "5. Return it after your rental period."
            );

        }
    );



/* =========================================
   FAQ
========================================= */

function showFAQ(event) {

    event.preventDefault();


    alert(
        "FREQUENTLY ASKED QUESTIONS\n\n" +
        "How long is the rental?\n" +
        "4 days.\n\n" +
        "Can I save a dress?\n" +
        "Yes. Click a dress and add it to your favorites.\n\n" +
        "How do I rent?\n" +
        "Click a dress and add it to your rental bag."
    );

}


// FAQ links now navigate to the dedicated FAQ page.
document.querySelectorAll('#faqLink, .faqButton').forEach(link => {
    link.setAttribute('href', 'faq.html');
});

/* =========================================
   SOCIAL MEDIA
========================================= */

document
    .querySelectorAll(".socialLink")
    .forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const social =
                        link.dataset.social;


                    alert(
                        social +
                        " account has not been connected yet."
                    );

                }
            );

        }
    );



/* Legal pages and membership links use normal page navigation. */
