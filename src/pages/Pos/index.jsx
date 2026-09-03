import { useState } from "react";

function POS() {

    const [shiftOpen, setShiftOpen] = useState(false);

    const [shiftData, setShiftData] = useState({
        openingCash: 0,
        openedAt: null,
    });

    const openShift = () => {

        const openingCash = window.prompt(
            "Enter opening cash"
        );

        if (openingCash === null) {
            return;
        }

        setShiftData({
            openingCash: Number(openingCash),
            openedAt: new Date(),
        });

        setShiftOpen(true);
    };

    const closeShift = () => {

        const confirmClose = window.confirm(
            "Are you sure you want to close this shift?"
        );

        if (!confirmClose) {
            return;
        }

        setShiftOpen(false);

        setShiftData({
            openingCash: 0,
            openedAt: null,
        });
    };

    return (
        <div className="pos-container">

            {/* ========================= */}
            {/* CLOSED SHIFT */}
            {/* ========================= */}

            {!shiftOpen && (

                <div className="pos-shift-screen">

                    <div className="pos-logo">
                        NOMADE POS
                    </div>

                    <div className="pos-shift-icon">
                        🔒
                    </div>

                    <h3>
                        Shift Closed
                    </h3>

                    <p className="text-muted">
                        Open a shift to start making sales.
                    </p>

                    <button
                        className="btn btn-primary pos-main-button"
                        onClick={openShift}
                    >
                        OPEN SHIFT
                    </button>

                </div>

            )}

            {/* ========================= */}
            {/* OPEN SHIFT */}
            {/* ========================= */}

            {shiftOpen && (

                <div className="pos-app">

                    {/* HEADER */}

                    <div className="pos-header">

                        <div>
                            <strong>
                                NOMADE POS
                            </strong>
                        </div>

                        <div className="pos-status">
                            <span className="status-dot"></span>
                            OPEN
                        </div>

                    </div>


                    {/* SEARCH */}

                    <div className="pos-search">

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search product..."
                        />

                    </div>


                    {/* PRODUCTS */}

                    <div className="pos-products">

                        <h6>
                            COFFEE
                        </h6>

                        <div className="product-grid">

                            <button className="product-card">
                                <strong>
                                    Americano
                                </strong>

                                <span>
                                    ₱49
                                </span>
                            </button>

                            <button className="product-card">
                                <strong>
                                    Caffé Latte
                                </strong>

                                <span>
                                    ₱69
                                </span>
                            </button>

                            <button className="product-card">
                                <strong>
                                    Spanish Latte
                                </strong>

                                <span>
                                    ₱89
                                </span>
                            </button>

                            <button className="product-card">
                                <strong>
                                    Mocha Latte
                                </strong>

                                <span>
                                    ₱99
                                </span>
                            </button>

                        </div>

                    </div>


                    {/* CURRENT ORDER */}

                    <div className="pos-cart">

                        <div className="cart-header">

                            <strong>
                                Current Order
                            </strong>

                            <span>
                                0 items
                            </span>

                        </div>

                        <div className="cart-empty">

                            No items selected.

                        </div>

                    </div>


                    {/* TOTAL */}

                    <div className="pos-checkout">

                        <div className="total-row">

                            <span>
                                TOTAL
                            </span>

                            <strong>
                                ₱0.00
                            </strong>

                        </div>

                        <button
                            className="btn btn-success charge-button"
                            disabled
                        >
                            CHARGE
                        </button>

                    </div>


                    {/* BOTTOM NAVIGATION */}

                    <div className="pos-bottom-nav">

                        <button>
                            🛒
                            <span>Sale</span>
                        </button>

                        <button>
                            🧾
                            <span>Tickets</span>
                        </button>

                        <button
                            onClick={closeShift}
                        >
                            🔒
                            <span>Close Shift</span>
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default POS;