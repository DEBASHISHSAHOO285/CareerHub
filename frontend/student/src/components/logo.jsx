import { Link } from "react-router-dom";

function Logo({ to = "/" }) {
    return (
        <Link
            to={to}
            className="careerhub-logo"
            style={{
                width: "50px",
                height: "50px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
            }}
        >
            <img
                src="/image/careerhub-logo.png"
                alt="CareerHub"
                style={{
                    width: "60px",
                    height: "60px",
                    maxWidth: "60px",
                    maxHeight: "60px",
                    objectFit: "contain",
                    display: "block",
                }}
            />
        </Link>
    );
}

export default Logo;