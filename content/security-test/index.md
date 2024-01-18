---
emoji: 🦻🏼🖥️
title: 개발자 테스트 간편화를 위한 Custom Security Support 기능 도입기
date: '2024-01-14 17:00:00'
author: 박세연
tags: 테스트 간편화
categories: Tech
---

안녕하세요. 모아밤팀의 서버 개발자 박세연입니다!

Custom Secuirty를 만들면서 통합 테스트를 하게 되면 해당 필터를 거치게 되면서 테스트에 설정이 많아졌습니다. 이는 곧 개발 속도가 늦춰지는 문제가 발생하면서 이를 간편하게 만들어 주고자 Support 클래스를 만들게 되었는데, 그 도입 과정에 대해 공유하고자 합니다.

---

## 상황
모아밤 서비스에서는 따로 Spring security를 도입하지 않았습니다. 그렇기에 로그인 및 cors등 여러 필터를 직접 구현해야 했습니다. 문제는 테스트 코드를 작성하면서 발생했습니다.

`Service`, `Repository` 테스트 같은 경우에는 단위 테스트 및 DB와의 단위 테스트만 했기 때문에 문제가 없지만, `Presentation Layer`에서는 전체 통합 테스트를 진행하기로 했습니다. 이렇게 되니 모든 통합 테스트의 custom filter를 거치게 되면서 테스트가 실패하고, 통과하기 위해 쿠키에 토큰을 넣어주는 등의 기본 설정들을 해줘야 합니다.

이로인해, 테스트를 작성하는데 많은 시간이 들어가고, 테스트하고자 하는 부분에 집중하지 못하며, 반복적인 코드들이 많이 들어가는 것을 확인했습니다.


## 요구 사항

1. @SpringBootTest 어노테이션은 하나의 통합테스트를 나타내는 메타데이터로도 볼 수 있기 때문에 직접 작성하는 것이 좋을 거 같다.

@SpringBootTest와 같은 어노테이션은 통합테스트에서 빈들을 등록시켜주기 때문에 필요합니다. 따라서 통합테스트를 서포트해주는 클래스를 만들때 해당 어노테이션도 같이 생략하려 했지만, 메타데이터로도 볼 수 있기 때문에 분리하지 않았으면 좋겠다 했습니다.

2. 통합테스트에서 테스트하고 싶은 부분은 서비스 로직이지 필터가 정상 동작되는 것이 아니다.

말 그대로 어떤 API에 대한 통합 테스트는 해당 서비스 로직이 정상 동작하는지 확인하는 것이기 때문에, filter가 어떻게 동작하는지 알 필요가 없는 것입니다. 

3. 기본 구성이 최소한으로 하면 좋겠다.

테스트를 위해서 기본적인 많은 설정이 필요하다 하면 오히려 사용이 힘들어 질 수 있기 때문에 최소한의 어노테이션, 최소한의 클래스를 활용하면 좋겠다 생각했습니다.

4. 테스트 코드를 위해 운영 코드가 변경이 되지 않았으면 좋겠다.

테스트 코드나 테스트 코드 서포트를 위한 클래스를 적용하기 위해 운영코드가 변경되는건 주객전도가 되는 상황과 같다는 의견이 있었습니다.

## Filter 구성

Filter의 구성 및 예외 처리 방식에 따라 support 클래스를 제공하는 방식도 많이 바뀔 거 같습니다.

현재 Filter는 `CorsFilter`, `PathFilter`, `AuthorizationFilter` 총 3개로 구성되어 있습니다.

corsFilter는 요청에 따라 cors를 허용할지 아님 예외를 던질지 처리하는 필터이고, PathFilter의 경우, 요청하는 Path에 따라 인가 필터를 거칠지 아닐지를 선택하는 필터이며
AuthorizationFilter의 경우 로그인 할때 사용자가 인가 토큰을 가지고 있는지 위변조 한건 아닌지를 판단하고 ContextHolder에 사용자 정보를 넣고 Controller로 전달까지 해주는 역할을 합니다.

모아밤 서비스의 경우 모든 기능들이 로그인인이 되어있나 아닌가에 따라 달라지다 보니, 위와 같이 간단하게만 적용해도 되는 상황이었습니다.

## WithoutFilterSupporter 클래스

먼저 필터부터 거치지 않도록 해야했기 때문에 필터 클래스에서 정상 동작이 되도록 해야 했습니다.

문제 해결을 위해 크게 2가지 방법으로 접근하였습니다.
1. `AuthorizationFilter`등 security filter들을 인터페이스화 하여 test profile에서만 동작하는 클래스를 적용하는 방법
2. 각 필터에서 예외를 잡히지 않기 위해, 특정 부분을 Mock으로 처리하는 방법


1번의 경우는 Spring Security에서 인증 필터만 항상 인증 되도록 만들어서 사용하는 방식과 유사합니다. 다만 이 경우 인가 필터를 거치게 되면 익명의 사용자가 반환되는 것 처럼 하면됩니다.
다만 제가 구현한 custom 필터의 경우 exception 필터를 추가로 두지 않아서 CorsFilter와 AuthorizationFilter각각에서 예외를 처리하다 보니, 위와 같이 하면 두 filter 클래스를 test profile에 맞게 변경해야 했습니다.

따라서 2번 방식을 사용하게 되었습니다.

```
@ExtendWith(FilterProcessExtension.class)
public class WithoutFilterSupporter {

	@MockBean
	private PathResolver pathResolver;
	

	@SpyBean
	private CorsFilter corsFilter;

	@BeforeEach
	void setUpMock() {
		willReturn("http://localhost:8080")
			.given(corsFilter).getReferer(any());

		willReturn(Optional.of(PathResolver.Path.builder()
			.uri("/")
			.role(Role.USER)
			.build()))
			.given(pathResolver).permitPathMatch(any());
	}
}
```
위와 같이 Filter에서 사용하는 클래스를 mock bean으로 등록함으로써 적용시켰습니다

## @WithMember

위 코드는 단순 필터만 넘기는 기능이라 ContextHolder에 사용자의 정보를 넣어줘야 합니다.
위 기능은 Spring security에서 사용하는 `@WithCustomUser`와 같이 만들려 했습니다.

어노테이션의 경우 `메서드`, `파라미터`에서 동작할 수 있도록 하고자 했고, id값과 닉네임을 커스터 마이징할 수 있어야 했기 때문에

```
@Target({ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface WithMember {

	long id() default 1L;

	String nickname() default "닉네임";

	Role role() default Role.USER;
}
```
위와 같이 어노테이션을 만들었습니다.


## FilterProcessExtension

이후 매 클래스나 메서드에 어노테이션을 추가하면 사용할 수 있도록 해야 했고,
Spring junit에서는 `BeforeEachCallback`, `AfterEachCallback`와 같은 인터페이스를 제공하여 해당 인터페이스를 사용했습니다.

위 인터페이스들은 매 테스트를 진행하기 전/후에 대해서 특정 기능을 넣을 수 있도록 해주는 인터페이스 입니다.
해당 인터페이스를 통해 `@WithMember`어노테이션이 존재하게 된다면 ContextHolder에 값을 넣도록 했습니다.

```
public class FilterProcessExtension implements BeforeEachCallback, AfterEachCallback, ParameterResolver {

	@Override
	public void beforeEach(ExtensionContext context) {
		AnnotatedElement annotatedElement =
			context.getElement().orElse(null);

		if (isNull(annotatedElement)) {
			return;
		}

		WithMember withMember = annotatedElement.getAnnotation(WithMember.class);

		if (isNull(withMember)) {
			return;
		}

		AuthorizationThreadLocal.setAuthMember(
			new AuthMember(withMember.id(), withMember.nickname(), withMember.role()));
	}

	@Override
	public void afterEach(ExtensionContext context) throws Exception {
		AuthorizationThreadLocal.remove();
	}
}
```

이번에는 파라미터로 해당 어노테이션이 존재한다면 값을 넣을 수 있도록 해야했습니다.

```
public class FilterProcessExtension implements ParameterResolver{
    ...

    @Override
	public boolean supportsParameter(ParameterContext parameterContext, ExtensionContext extensionContext) throws
		ParameterResolutionException {
		return parameterContext.getParameter().isAnnotationPresent(WithMember.class);
	}

	@Override
	public Object resolveParameter(ParameterContext parameterContext, ExtensionContext extensionContext) throws
		ParameterResolutionException {
		WithMember withMember = parameterContext.getParameter().getAnnotation(WithMember.class);

		if (isNull(withMember)) {
			return null;
		}

		return new AuthMember(withMember.id(), withMember.nickname(), withMember.role());
	}
}
```
파라미터의 경우 `ParameterResolver`의 인터페이스를 사용하여 값을 넣을 수 있습니다.

이렇게 한다면 `WithoutFilterSupporter`의 클래스를 통합테스트에 적용하면 바로 사용이 가능했습니다.

## 문서화 및 공유

이렇게 만들어서 인가된 사용자의 정보를 가져오는 법 및 테스트 방법에 대해 문서화 하여 팀원들과 discussion을 통해 공유하였습니다.

[회원: Controller 파라미터 인터페이스 및 Test 클래스 지원 인터페이스 지원 내용 및 사용법](https://github.com/orgs/team-moabam/discussions/49)


개발자의 편의성을 위해 위와 같은 기능을 제공하고자 했고, 실제로 사용하면서 편함을 느낄 수 있었습니다.