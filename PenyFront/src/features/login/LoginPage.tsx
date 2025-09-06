import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  TextInput,
  Title,
} from "@mantine/core";
import classes from "../login/styles/AuthenticationTitle.module.css";

const LoginPage = () => {
  return (

    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
      <Title ta="center" className={classes.title}>
        Welcome back!
      </Title>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <TextInput
          label="Email"
          placeholder="you@mantine.dev"
          required
          radius="md"
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          radius="md"
        />
        <Group justify="space-between" mt="lg">
            <Checkbox label="Remember me" />
            <Anchor
              component="button"
              size="sm"
            
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px #1976d2'}
              onBlur={e => e.currentTarget.style.boxShadow = 'none'}
            >
              Forgot password?
            </Anchor>
        </Group>
          <Button
            fullWidth
            mt="xl"
            radius="md"
            
          >
            Sign in
          </Button>
      </Paper>
    </div>
  );
};

export default LoginPage;
