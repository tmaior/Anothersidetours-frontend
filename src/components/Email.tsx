import React from "react";

interface EmailProps {
    status: "approved" | "declined" | "pending";
    time: string;
    duration: string;
    date: string;
    contactInformation: string[];
    totals: { label: string; amount: string }[];
}

const Email: React.FC<EmailProps> = ({ status, time, duration, date, contactInformation, totals }) => {
    const getStatusButton = () => {
        switch (status) {
            case "approved":
                return (
                    <button style={{ backgroundColor: "green", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px" }}>
                        ✓ Approved
                    </button>
                );
            case "declined":
                return (
                    <button style={{ backgroundColor: "red", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px" }}>
                        ✕ Declined
                    </button>
                );
            case "pending":
                return (
                    <button style={{ backgroundColor: "orange", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px" }}>
                        ⏸ Pending
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", padding: "20px" }}>
            <table width="100%" style={{ backgroundColor: "#ffffff", margin: "0 auto" }}>
                <tbody>
                <tr>
                    <td align="center">
                        <table width="600" style={{ margin: "20px auto" }}>
                            <tbody>
                            {/* Logo */}
                            <tr>
                                <td align="center" style={{ fontSize: "32px", fontWeight: "bold", padding: "20px 0" }}>LOGO</td>
                            </tr>
                            {/* Status, Description, Icon Status */}
                            <tr>
                                <td align="center" style={{ fontSize: "18px", fontWeight: "bold", padding: "5px 0" }}>STATUS</td>
                            </tr>
                            <tr>
                                <td align="center" style={{ fontSize: "16px", padding: "5px 0" }}>DESCRIPTION</td>
                            </tr>
                            <tr>
                                <td align="center" style={{ fontSize: "16px", padding: "5px 0" }}>{getStatusButton()}</td>
                            </tr>
                            {/* Divider */}
                            <tr>
                                <td style={{ borderTop: "1px solid #ccc", padding: "10px 0" }}></td>
                            </tr>
                            {/* Data and Time */}
                            <tr>
                                <td style={{ padding: "10px" }}>
                                    <table width="100%">
                                        <tbody>
                                        <tr>
                                            <td style={{ fontWeight: "bold", paddingLeft: "10px" }}>{date}</td>
                                            <td align="right" style={{ paddingRight: "10px", fontWeight: "bold" }}>TIME</td>
                                        </tr>
                                        <tr>
                                            <td style={{ paddingLeft: "10px" }}>&nbsp;</td>
                                            <td align="right" style={{ paddingRight: "10px" }}>{duration}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            {/* Divider */}
                            <tr>
                                <td style={{ borderTop: "1px solid #ccc", padding: "10px 0" }}></td>
                            </tr>
                            {/* Contact Information and Totals */}
                            <tr>
                                <td>
                                    <table width="100%">
                                        <tbody>
                                        <tr>
                                            <td width="50%" valign="top" style={{ paddingLeft: "10px" }}>
                                                {contactInformation.map((info, index) => (
                                                    <p key={index} style={{ margin: 0, padding: "5px 0" }}>{info}</p>
                                                ))}
                                            </td>
                                            <td width="50%" valign="top" style={{ paddingRight: "10px" }}>
                                                {totals.map((total, index) => (
                                                    <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                                                        <span>{total.label}</span>
                                                        <span>{total.amount}</span>
                                                    </div>
                                                ))}
                                                <div style={{ borderTop: "1px solid #ccc", marginTop: "5px" }}></div>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            {/* Divider */}
                            <tr>
                                <td style={{ borderTop: "1px solid #ccc", padding: "10px 0" }}></td>
                            </tr>
                            {/* Final Section */}
                            <tr>
                                <td>
                                    <table width="100%">
                                        <tbody>
                                        <tr>
                                            <td style={{ paddingLeft: "10px" }}>test</td>
                                            <td align="center">CONTACT INFORMATION</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} align="center" style={{ paddingTop: "10px" }}>
                                                <p style={{ margin: 0 }}>{date} &nbsp; {time}</p>
                                                <p style={{ margin: 0 }}>guests</p>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            {/* Divider */}
                            <tr>
                                <td style={{ borderTop: "1px solid #ccc", padding: "10px 0" }}></td>
                            </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Email;
