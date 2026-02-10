import { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AppTheme from "../shared-ui-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";

export default function PrivacyPage(props: { disableCustomTheme?: boolean }) {
  useEffect(() => {
    document.title = "Otas | Privacy";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Container maxWidth="md" sx={{ py: 8, my: 14 }}>
        <Typography variant="h3" gutterBottom>
          Privacy Policy
        </Typography>

        <Box mb={3}>
          <Typography variant="body1">
            Otas ("we", "us", or "our") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and protect the
            personal information you provide to us when using our algorithmic
            trading platform.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          1. Information We Collect
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            We may collect personal information such as your name, email
            address, contact number, and payment information. We may also
            collect usage data and trading-related data, including API usage,
            algorithms submitted, and interaction with financial data.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          2. How We Use Your Information
        </Typography>
        <Box mb={3}>
          <Typography variant="body1" component="div">
            We use your data to:
            <ul>
              <li>Provide access to our trading tools and APIs</li>
              <li>Maintain and improve our platform</li>
              <li>Send important account or service-related notices</li>
              <li>
                Comply with regulatory requirements in jurisdictions we operate
                in (India, China, Singapore, US)
              </li>
            </ul>
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          3. Data Sharing
        </Typography>
        <Box mb={3}>
          <Typography variant="body1" component="div">
            We do not sell your personal data. We may share your information
            with:
            <ul>
              <li>Service providers under strict confidentiality agreements</li>
              <li>Regulatory authorities where legally required</li>
              <li>Law enforcement if requested with valid jurisdiction</li>
            </ul>
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          4. Data Retention
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            We retain your data as long as your account is active or as required
            to comply with legal obligations, resolve disputes, and enforce our
            agreements.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          5. Security
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            We implement technical and organizational measures to protect your
            data. However, no system is 100% secure. We encourage users to adopt
            strong security practices.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          6. International Data Transfers
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            Your information may be transferred to and maintained on servers
            located outside your state, province, country, or other governmental
            jurisdiction where data protection laws may differ.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          7. Your Rights
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            You may have rights to access, correct, or delete your personal data
            depending on your jurisdiction. Contact us at{" "}
            <strong>privacy@otas.com</strong> to make a request.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          8. Updates to This Policy
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            We may update this Privacy Policy from time to time. If changes are
            material, we will notify you via the platform or email.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          9. Contact Us
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            For questions about this policy, contact us at:
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> privacy@otas.com
            <br />
            <strong>Address:</strong> [To be registered]
          </Typography>
        </Box>
      </Container>
    </AppTheme>
  );
}
