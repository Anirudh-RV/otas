import { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AppTheme from "../shared-ui-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";

export default function TermsPage(props: { disableCustomTheme?: boolean }) {
  useEffect(() => {
    document.title = "Otas | Terms and Conditions";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />

      <Container maxWidth="md" sx={{ py: 8, my: 14 }}>
        <Typography variant="h3" gutterBottom>
          Terms and Conditions
        </Typography>

        <Box mb={3}>
          <Typography variant="body1">
            Welcome to Otas, an algorithmic trading platform. These Terms and
            Conditions ("Terms") govern your use of our website, services, and
            tools (collectively, the "Platform"). By using the Platform, you
            agree to be bound by these Terms.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          1. Use of Platform
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            You must be at least 18 years old and capable of entering into a
            legally binding agreement. You agree to use the Platform only for
            lawful purposes and in accordance with all applicable laws and
            regulations in India, China, Singapore, the US, and any other
            relevant jurisdiction.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          2. Account Responsibility
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. You agree to notify us immediately of any unauthorized use
            or breach of security.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          3. Intellectual Property
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            All content on the Platform, including software, algorithms,
            trademarks, and documentation, is the property of Otas or its
            licensors. You may not reproduce, modify, distribute, or create
            derivative works without our prior written consent.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          4. Financial Disclaimer
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            Otas does not provide financial advice. All trading involves risk,
            and past performance is not indicative of future results. You are
            solely responsible for all trading decisions and outcomes based on
            the Platform's tools and data.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          5. Termination
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            We reserve the right to suspend or terminate your access to the
            Platform at our discretion, without prior notice, for violations of
            these Terms or for any security or legal concerns.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          6. Limitation of Liability
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            To the maximum extent permitted by law, Otas shall not be liable for
            any indirect, incidental, or consequential damages resulting from
            your use of the Platform.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          7. Changes to Terms
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            We may update these Terms from time to time. Continued use of the
            Platform after changes become effective constitutes your acceptance
            of the revised Terms.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          8. Governing Law
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            These Terms are governed by the laws of the jurisdiction in which
            Otas is legally registered. You agree to submit to the exclusive
            jurisdiction of the relevant courts in that location.
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom>
          9. Contact Us
        </Typography>
        <Box mb={3}>
          <Typography variant="body1">
            If you have any questions about these Terms, please contact us at:
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> legal@otas.com
            <br />
            <strong>Address:</strong> [To be registered]
          </Typography>
        </Box>
      </Container>
    </AppTheme>
  );
}
